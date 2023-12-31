/*
 * This file was generated by the Gradle 'init' task.
 *
 * The settings file is used to specify which projects to include in your build.
 * For more detailed information on multi-project builds, please refer to https://docs.gradle.org/8.4/userguide/building_swift_projects.html in the Gradle documentation.
 */

plugins {
    // Apply the foojay-resolver plugin to allow automatic download of JDKs
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.7.0"
    id("io.freefair.lombok") version "8.4" apply false
    id("com.github.ben-manes.versions") version "0.50.0" apply false
}

rootProject.name = "tomcat-servlet-testing-example"
include("strcalc")
