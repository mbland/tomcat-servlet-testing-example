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
    testTask.dependsOn(war, testClasses)
    setJunitXmlOptions(testTask)

    // Based on advice from:
    // - https://docs.gradle.org/current/userguide/upgrading_version_8.html#test_task_default_classpath
    testTask.testClassesDirs = files(smallTests.map { it.testClassesDirs })
    testTask.classpath = files(smallTests.map { it.classpath })
    testTask.extensions.configure(JacocoTaskExtension::class) {
        isEnabled = false
    }
}

val mediumTests = tasks.register<Test>("test-medium") {
    description = "Runs medium integration tests annotated with @MediumTest."
    addCommonTestSuiteConfiguration(this)
    useJUnitPlatform { includeTags("medium") }
    shouldRunAfter(smallTests)
}

val largeTests = tasks.register<Test>("test-large") {
    description = "Runs large system tests annotated with @LargeTest."
    addCommonTestSuiteConfiguration(this)
    useJUnitPlatform { includeTags("large") }
    shouldRunAfter(mediumTests)
}

val allTestSizes = arrayOf(smallTests, mediumTests, largeTests)

val allTests = tasks.register<Task>("test-all") {
    description = "Runs the small, medium, and large test suites in order."
    group = "verification"
    dependsOn(allTestSizes)
}

internal val testResultsDir = java.testResultsDir
internal val aggregatorClass = "org.apache.tools.ant.taskdefs.optional." +
        "junit.XMLResultAggregator"

// Based on
// - https://blog.lehnerpat.com/post/2018-09-10/merging-per-suite-junit-reports-into-single-file-with-gradle-kotlin/
// - https://docs.gradle.org/current/userguide/ant.html
val mergeTestReports = fun(taskName: String) {
    val resultsDir = testResultsDir.dir(taskName).get().asFile
    val reportTaskName = "merged-report-$taskName"
    // logger.quiet(rootDir.toPath().relativize(resultsDir.toPath()).toString())

    if (!resultsDir.exists()) return

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
}

task("merge-test-reports") {
    description = "Merges all JUnit XML results files for each test size into" +
            " a single file."
    group = "verification"
    shouldRunAfter(allTestSizes)
    allTestSizes.forEach {
        suite: TaskProvider<Test> -> mergeTestReports(suite.get().name)
    }
}

tasks.named<JacocoReport>("jacocoTestReport") {
    shouldRunAfter(smallTests)
}

// Generates:
// - strcalc/build/reports/jacoco/jacocoXmlTestReport/jacocoXmlTestReport.xml
tasks.register<JacocoReport>("jacocoXmlTestReport") {
    shouldRunAfter(smallTests)
    executionData(smallTests.get())
    sourceSets(sourceSets.main.get())
    reports {
        html.required = false
        xml.required = true
    }
}

tasks.named("check") {
    dependsOn(allTests)
}
