/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

plugins {
    war
}

repositories {
    // Use Maven Central for resolving dependencies.
    mavenCentral()
}

dependencies {
    // Use JUnit Jupiter for testing.
    testImplementation(libs.junit)

    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // This dependency is used internally, and not exposed to consumers on their
    // own compile classpath.
    providedCompile(libs.servlet)
}

// Apply a specific Java toolchain to ease working on different environments.
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
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
val smallTests = tasks.named<Test>("test") {
    description = "Runs small unit tests annotated with @SmallTest"
    useJUnitPlatform { includeTags("small") }
}
val testClasses = tasks.named("testClasses")
val war = tasks.named("war")

val addCommonTestSuiteConfiguration = { testTask: Test ->
    testTask.group = "verification"
    testTask.dependsOn(war, testClasses)

    // Based on advice from:
    // - https://docs.gradle.org/current/userguide/upgrading_version_8.html#test_task_default_classpath
    testTask.testClassesDirs = files(smallTests.map { it.testClassesDirs })
    testTask.classpath = files(smallTests.map { it.classpath })
}

val mediumTests = tasks.register<Test>("test-medium") {
    description = "Runs medium integration tests annotated with @MediumTest"
    addCommonTestSuiteConfiguration(this)
    useJUnitPlatform { includeTags("medium") }
    shouldRunAfter(smallTests)
}

val largeTests = tasks.register<Test>("test-large") {
    description = "Runs large system tests annotated with @LargeTest"
    addCommonTestSuiteConfiguration(this)
    useJUnitPlatform { includeTags("large") }
    shouldRunAfter(mediumTests)
}

val allTests = tasks.register<Task>("test-all") {
    description = "Runs the small, medium, and large test suites in order"
    group = "verification"
    dependsOn(smallTests, mediumTests, largeTests)
}

tasks.named("check") {
    dependsOn(allTests)
}
