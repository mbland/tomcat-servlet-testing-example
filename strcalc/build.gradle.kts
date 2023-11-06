/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

plugins {
    war
    jacoco
}

repositories {
    // Use Maven Central for resolving dependencies.
    mavenCentral()
}

val antJUnit: Configuration by configurations.creating

dependencies {
    testImplementation(libs.junit)
    testImplementation(libs.hamcrest)
    testImplementation(libs.tomcat)
    testImplementation(libs.jasper)

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
val setJunitXmlOptions = { testTask: Test ->
    testTask.reports {
        junitXml.apply { isOutputPerTestCase = true }
    }
}

val smallTests = tasks.named<Test>("test") {
    description = "Runs small unit tests annotated with @SmallTest."
    useJUnitPlatform { includeTags("small") }
    setJunitXmlOptions(this)
}
val testClasses = tasks.named("testClasses")
val war = tasks.named("war")

val addCommonTestSuiteConfiguration = { testTask: Test ->
    testTask.group = "verification"
    testTask.dependsOn(testClasses)
    setJunitXmlOptions(testTask)

    // Based on advice from:
    // - https://docs.gradle.org/current/userguide/upgrading_version_8.html#test_task_default_classpath
    val test by testing.suites.existing(JvmTestSuite::class)
    testTask.testClassesDirs = files(test.map {
        it.sources.output.classesDirs
    })
    testTask.classpath = files(test.map { it.sources.runtimeClasspath })
}

val mediumCoverageTests = tasks.register<Test>("test-medium-coverage") {
    description = "Runs medium integration tests annotated with " +
            "@MediumCoverageTest."
    addCommonTestSuiteConfiguration(this)
    useJUnitPlatform { includeTags("medium & coverage") }
    shouldRunAfter(smallTests)
}

val mediumTests = tasks.register<Test>("test-medium") {
    description = "Runs medium integration tests annotated with @MediumTest."
    addCommonTestSuiteConfiguration(this)
    useJUnitPlatform { includeTags("medium & !coverage") }
    shouldRunAfter(smallTests, mediumCoverageTests)
    extensions.configure(JacocoTaskExtension::class) {
        isEnabled = false
    }
}

val largeTests = tasks.register<Test>("test-large") {
    description = "Runs large system tests annotated with @LargeTest."
    addCommonTestSuiteConfiguration(this)
    dependsOn(war)
    useJUnitPlatform { includeTags("large") }
    shouldRunAfter(mediumCoverageTests, mediumTests)
    extensions.configure(JacocoTaskExtension::class) {
        isEnabled = false
    }
}

val allTestSizes = arrayOf(
        smallTests, mediumCoverageTests, mediumTests, largeTests
)

val allTests = tasks.register<Task>("test-all") {
    description = "Runs the small, medium, and large test suites in order."
    group = "verification"
    dependsOn(allTestSizes)
}

internal val testResultsDir = java.testResultsDir
internal val aggregatorClass = "org.apache.tools.ant.taskdefs.optional." +
        "junit.XMLResultAggregator"

val relativeToRootDir = fun(absPath: java.nio.file.Path): java.nio.file.Path {
    return rootDir.toPath().relativize(absPath)
}

// Based on
// - https://blog.lehnerpat.com/post/2018-09-10/merging-per-suite-junit-reports-into-single-file-with-gradle-kotlin/
// - https://docs.gradle.org/current/userguide/ant.html
val mergeTestReports = fun(resultsDir: File) {
    val taskName = resultsDir.name
    val relResultsDir = relativeToRootDir(resultsDir.toPath())
    val reportTaskName = "merged-report-$taskName"

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
    logger.quiet("merged test reports: " + relResultsDir +
            "/TESTS-TestSuites.xml")
}

task("merge-test-reports") {
    description = "Merges all JUnit XML results files for each test size into" +
            " a single file."
    group = "verification"
    shouldRunAfter(allTestSizes)

    doLast {
        val resultsDir = testResultsDir.asFile.get()

        if (resultsDir.exists()) {
            resultsDir.listFiles().filter{ d: File -> d.isDirectory }.forEach {
                dir: File -> mergeTestReports(dir)
            }
        }
    }
}

tasks.named<JacocoReport>("jacocoTestReport") {
    shouldRunAfter(smallTests, mediumCoverageTests)
    executionData(mediumCoverageTests.get())
}

// Generates:
// - strcalc/build/reports/jacoco/jacocoXmlTestReport/jacocoXmlTestReport.xml
tasks.register<JacocoReport>("jacocoXmlTestReport") {
    shouldRunAfter(smallTests, mediumCoverageTests)
    executionData(smallTests.get(), mediumCoverageTests.get())
    sourceSets(sourceSets.main.get())
    reports {
        html.required = false
        xml.required = true
    }
}

tasks.named("check") {
    dependsOn(allTests)
}
