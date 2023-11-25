/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import com.github.benmanes.gradle.versions.updates.DependencyUpdatesTask

plugins {
    war
    jacoco
    id("com.github.node-gradle.node")
    id("com.github.ben-manes.versions")
}

repositories {
    // Use Maven Central for resolving dependencies.
    mavenCentral()
}

val antJUnit: Configuration by configurations.creating

dependencies {
    implementation(libs.jandex)
    implementation(libs.weld)

    testImplementation(libs.junit)
    testImplementation(libs.hamcrest)
    testImplementation(libs.tomcat)
    testImplementation(libs.jasper)
    testImplementation(libs.selenium)

    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // This dependency is used internally, and not exposed to consumers on their
    // own compile classpath.
    providedCompile(libs.servlet)

    antJUnit(libs.antJunit)
}

// Apply a specific Java toolchain to ease working on different environments.
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

jacoco {
    toolVersion = "0.8.11"
}

// The frontend sources are under src/main/frontend. The Node plugin generates
// the pnpm_build and pnpm_test-ci task definitions from the "scripts" field of
// package.json.
node {
    nodeProjectDir = file("src/main/frontend")
}

// Set inputs and outputs for the pnpm_build and pnpn_test-ci frontend tasks.
// This enables Gradle to cache the results instead of executing these tasks
// unconditionally on every build.
//
// The vite.config.js file in src/main/frontend specifies:
//
// - The output directory, build/webapp
// - The default test results directory, build/test-results/test-frontend
// - The coverage directory, build/reports/frontend/coverage
//
// The vite.config.ci-browser.js file, used by pnpm_test-ci, also specifies
// the build/test-results/test-frontend-browser directory.
val frontendDir = project.layout.projectDirectory.dir("src/main/frontend")
val frontendSources = fileTree(frontendDir) {
    exclude("node_modules", ".*", "*.md")
}
val frontendOutputDir = project.layout.buildDirectory.dir("webapp").get()

val frontendBuild = tasks.named<Task>("pnpm_build") {
    description = "Build src/main/frontend JavaScript into build/webapp"
    inputs.files(frontendSources)
    outputs.dir(frontendOutputDir)
}

val frontendTest = tasks.named<Task>("pnpm_test-ci") {
    description = "Test frontend JavaScript in src/main/frontend"
    dependsOn(frontendBuild)
    inputs.files(frontendSources)

    val resultsDir = java.testResultsDir.get()
    outputs.dir(resultsDir.dir("test-frontend"))
    outputs.dir(resultsDir.dir("test-frontend-browser"))
}

// Configure the "war" task generated by the Gradle War plugin to depend upon
// the frontend build and to include its output files from build/webapp. This is
// in addition to the files within src/main/webapp, which the task includes by
// default.
//
// - https://docs.gradle.org/current/userguide/war_plugin.html
val war = tasks.named("war")
tasks.war {
    dependsOn(frontendBuild)
    from(frontendOutputDir)
}

// The small/medium/large test schema is implemented via JUnit5 composite tags
// and custom Test tasks. See:
//
// - https://mike-bland.com/2023/08/31/the-test-pyramid-and-the-chain-reaction.html
// - https://junit.org/junit5/docs/current/user-guide/#writing-tests-meta-annotations
// - https://docs.gradle.org/current/userguide/java_testing.html#test_grouping
//
// This doesn't use the incubating JVM Test Suite plugin because it doesn't
// support includeTags():
//
// - https://docs.gradle.org/current/userguide/jvm_test_suite_plugin.html#jvm_test_suite_plugin
val testClasses = tasks.named("testClasses")
val webappInputs = project.layout.projectDirectory.dir("src/main/webapp")

val setCommonTestOptions = { testTask: Test ->
    testTask.reports { junitXml.apply { isOutputPerTestCase = true } }
    testTask.testLogging {
        showStandardStreams = project.hasProperty("testoutput")
    }
}

val setLargerTestOptions = { testTask: Test ->
    testTask.group = "verification"
    testTask.dependsOn(testClasses)
    setCommonTestOptions(testTask)

    // Based on advice from:
    // - https://docs.gradle.org/current/userguide/upgrading_version_8.html#test_task_default_classpath
    @Suppress("UnstableApiUsage")
    val test by testing.suites.existing(JvmTestSuite::class)

    testTask.testClassesDirs = files(test.map {
        @Suppress("UnstableApiUsage")
        it.sources.output.classesDirs
    })
    testTask.classpath = files(test.map {
        @Suppress("UnstableApiUsage")
        it.sources.runtimeClasspath
    })
}

val smallTests = tasks.named<Test>("test") {
    description = "Runs small unit tests annotated with @SmallTest."
    useJUnitPlatform { includeTags("small") }
    setCommonTestOptions(this)
}

val mediumCoverageTests = tasks.register<Test>("test-medium-coverage") {
    description = "Runs medium integration tests annotated with " +
            "@MediumCoverageTest."
    setLargerTestOptions(this)
    dependsOn(frontendBuild)
    inputs.dir(webappInputs)
    useJUnitPlatform { includeTags("medium & coverage") }
    shouldRunAfter(smallTests, frontendTest)
}

val mediumTests = tasks.register<Test>("test-medium") {
    description = "Runs medium integration tests annotated with @MediumTest."
    setLargerTestOptions(this)
    dependsOn(frontendBuild)
    inputs.dir(webappInputs)
    useJUnitPlatform { includeTags("medium & !coverage") }
    shouldRunAfter(smallTests, mediumCoverageTests, frontendTest)
    extensions.configure(JacocoTaskExtension::class) {
        isEnabled = false
    }
}

val largeTests = tasks.register<Test>("test-large") {
    description = "Runs large system tests annotated with @LargeTest."
    setLargerTestOptions(this)
    dependsOn(war)
    useJUnitPlatform { includeTags("large") }
    shouldRunAfter(mediumCoverageTests, mediumTests, frontendTest)
    extensions.configure(JacocoTaskExtension::class) {
        isEnabled = false
    }
}

val allTestSizes = arrayOf(
        smallTests, mediumCoverageTests, mediumTests, largeTests
)

val allTests = tasks.register<Task>("test-all") {
    description = "Runs the frontend, small, medium, and large test suites, " +
            "in that order."
    group = "verification"
    dependsOn(frontendTest, allTestSizes)
}

tasks.named("check") {
    dependsOn(allTests)
}

// Used to emit paths of JUnit and coverage report files relative to the root
// directory of the project repository.
val relativeToRootDir = fun(absPath: java.nio.file.Path): java.nio.file.Path {
    return rootDir.toPath().relativize(absPath)
}

// JUnit emits a single test result file containing a single <testsuite>
// element for each test class. The dorny/test-reporter GitHub action from
// .github/workflows/publish-test-results.yaml requires a single, consolidated
// file containing a <testsuites> element.
//
// The "merge-test-reports" task, defined below, uses this mergeTestReports
// function to create the consolidated <testsuites> file. The implementation
// is based on:
//
// - https://blog.lehnerpat.com/post/2018-09-10/merging-per-suite-junit-reports-into-single-file-with-gradle-kotlin/
// - https://docs.gradle.org/current/userguide/ant.html
val mergeTestReports = fun(resultsDir: File) {
    val taskName = resultsDir.name

    // The `pnpm_test-ci` output is already merged. Trying to merge it again
    // results in an empty file, so skip it.
    if (taskName.startsWith("test-frontend")) return

    val reportTaskName = "merged-report-$taskName"
    val aggregatorClass = "org.apache.tools.ant.taskdefs.optional." +
            "junit.XMLResultAggregator"

    ant.withGroovyBuilder {
        "taskdef"(
                "name" to reportTaskName,
                "classname" to aggregatorClass,
                "classpath" to antJUnit.asPath
        )
        reportTaskName("todir" to resultsDir) {
            "fileset"(
                    "dir" to resultsDir,
                    "includes" to "TEST-*.xml")
        }
    }
    logger.quiet("merged test reports: " +
            relativeToRootDir(resultsDir.toPath()) +
            "/TESTS-TestSuites.xml")
}

task("merge-test-reports") {
    description = "Merges all JUnit XML results files for each test size into" +
            " a single file."
    group = "verification"
    shouldRunAfter(allTestSizes)

    doLast {
        val resultsDir = java.testResultsDir.asFile.get()

        if (resultsDir.exists()) {
            resultsDir.listFiles().filter{ d: File -> d.isDirectory }.forEach {
                dir: File -> mergeTestReports(dir)
            }
        }
    }
}

// Emits the path to a JaCoCo coverage report file if the type of report
// (html, xml, or csv) is required. A report is "required" if the task's
// "report {}" configuration block sets, for example, `html.required = true`.
val emitReportLocation = fun(report: Report) {
    if (report.required.get()) {
        val location = report.outputLocation.get().asFile.toPath()
        logger.quiet("coverage report: " + relativeToRootDir(location))
    }
}

// Adds custom configuration to the jacocoTestReport task generated by the
// Gradle JaCoCo plugin.
tasks.named<JacocoReport>("jacocoTestReport") {
    shouldRunAfter(smallTests, mediumCoverageTests)
    executionData(mediumCoverageTests.get())
    doLast {
        reports.forEach { r -> emitReportLocation(r) }
    }
}

// Generates an XML file suitable to upload to Coveralls.io from
// .github/workflows/run-tests.yaml:
//
// - strcalc/build/reports/jacoco/jacocoXmlTestReport/jacocoXmlTestReport.xml
tasks.register<JacocoReport>("jacocoXmlTestReport") {
    shouldRunAfter(smallTests, mediumCoverageTests)
    executionData(smallTests.get(), mediumCoverageTests.get())
    sourceSets(sourceSets.main.get())
    reports {
        html.required = false
        xml.required = true
    }
    doLast {
        reports.forEach { r -> emitReportLocation(r) }
    }
}

// Utility function used by the ben-manes/gradle-versions-plugin tasks,
// configured below. See:
//
// - https://github.com/ben-manes/gradle-versions-plugin#rejectversionsif-and-componentselection
fun isNonStable(version: String): Boolean {
    val stableKeyword = listOf("RELEASE", "FINAL", "GA").any {
        version.uppercase().contains(it)
    }
    val regex = "^[0-9,.v-]+(-r)?$".toRegex()
    val isStable = stableKeyword || regex.matches(version)
    return isStable.not()
}

tasks.withType<DependencyUpdatesTask> {
    revision = "release"
    gradleReleaseChannel = "current"
    rejectVersionIf {
        isNonStable(candidate.version) && !isNonStable(currentVersion)
    }
}
