# Tomcat Servlet Testing Example

My attempt at an outside-in testing example in Java using a Tomcat servlet
container. It will eventually incorporate the [String Calculator kata][] to
demonstrate Test-Driven Development and small unit tests in general. However, it
will illustrate a full, balanced, [Test Pyramid][] based testing strategy
incorporating developer written automated tests of all sizes (small, medium, and
large).

Though I've been a programmer for years across many other programming languages,
I'm learning a lot about the Java ecosystem for the first time. It will take
some time before this project looks like a complete working example that makes
sense.

The plan is to develop an exercise comprised of the following steps:

- Set up a continuous integration pipeline based on [GitHub Actions][].
- Creating a [walking skeleton][] implementation and adding a large end-to-end
  test to validate it, likely using [Selenium WebDriver][] as well as [headless
  Chrome][].
- Developing the String Calculator using TDD and small unit tests.
- Adding a medium integration test to ensure the Servlet passes parameters to
  the internal String Calculator logic and passes back the results.
- Adding unit tests for JavaScript components, likely incorporating the [Mocha
  testing framework][], [Chai assertion library][], and [Sinon test double framework][].
- Using [test doubles][] in unit tests. This may involve extending the String
  Calculator example or adding a completely different one, possibly based on
  [Apache Solr][].

## Status

I've got an initial `Hello, World!` servlet running under Tomcat, validated by a
basic JUnit test. I can do this comfortably from the command line and IntelliJ
IDEA; VSCode is proving challenging for now.

The next step is to add a proper [HTML &lt;form&gt;][] and WebDriver test to
complete the walking skeleton (i.e., a complete, minimally functional
application deployment).

## Open Source License

This software is made available as [Open Source software][] under the [Mozilla
Public License 2.0][]. For the text of the license, see the
[LICENSE.txt](LICENSE.txt) file.

## Development environment setup

### Install the Java Development Kit

I installed the latest JDK 21.0.1 from [Eclipse Temurin&trade; Latest
Releases][] via [SDKMAN!][].

### Install the [Tomcat servlet container][]

I followed the [Tomcat 10.1 Setup instructions][] to install Tomcat locally
at `/opt/tomcat/apache-tomcat-10.1.15`. I created `bin/tomcat.sh` as a thin
wrapper around Tomcat's `bin/catalina.sh` that detects and sets `JAVA_HOME`
and sets `CATALINA_HOME`. Verified that it was installed correctly via
`bin/tomcat.sh start` and visiting <http://localhost:8080/>.

- [Introduction to Apache Tomcat](https://www.baeldung.com/tomcat)

### Install [Gradle][]

I installed Gradle 8.4 via [SDKMAN!][], which also required installing the
20.0.2 JDK, since it can _build_ Java 21, but needs Java 20 to run. See the
[Gradle compatibility matrix for Java][].

### [Create a Java project with Gradle][]

After running `gradle init` to create a library as part of the [Gradle
Tutorial][]:

- Renamed the `lib` directory to `strcalc`.
- Replaced the `java-library` plugin in `strcalc/build.gradle.kts` with
  `war` and made other changes per the [Gradle WAR plugin][].
- Adjusted `gradle/libs.versions.toml` accordingly, including enabling a
  `provided` dependency on the desired [Jakarta Servlet Specification][]
  version.

### Install [IntelliJ IDEA][] and/or [Visual Studio Code][]

The project mainly supports IntelliJ IDEA right now, though I'm starting to play
with VSCode.

I recently used VSCode extensively to develop my [EListMan][] project in
[Go][], but with Java, I'm having an easier time so far with IntelliJ IDEA.
(I still prefer to edit this file and other [Markdown][] files in VSCode,
however.)

Here are some VSCode extensions and other references I'm using to start making
sense of Java in VSCode:

- [Getting Started with Java in VS Code](https://code.visualstudio.com/docs/java/java-tutorial)
- [Java build tools in VS Code](https://code.visualstudio.com/docs/java/java-build)
- [VSCode: Gradle for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-gradle)
- [VSCode: Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack)
- [Managing Java Projects in VS Code](https://code.visualstudio.com/docs/java/java-project)
- [VSCode: Navigate and edit Java source code](https://code.visualstudio.com/docs/java/java-editing)
- [Testing Java with Visual Studio Code](https://code.visualstudio.com/docs/java/java-testing)

## Running Tomcat and adding a Tomcat test helper

### [Create Tomcat > Local run configuration][]

In IntelliJ, I created the "Local Tomcat" run configuration, stored in the repo
as `.idea/runConfigurations/Local_Tomcat.xml`. In installs the WAR file (as
described by the [Tomcat deployment][] document) under the `/strcalc` context
(i.e., Tomcat serves the servlet at <http://localhost:8080/strcalc>).

Note that the `CATALINA_HOME` setting matches that from the **Install the Tomcat
servlet container** section above.

- [How to Deploy a WAR File to
  Tomcat](https://www.baeldung.com/tomcat-deploy-war)

### Write "Hello, World!" servlet and [JUnit][] test

The initial servlet responds with the classic hardcoded value `Hello, World!`.
The initial test expects Tomcat to be running and for
`<http://localhost:8080/strcalc>` to return this value.

Note that the value of the `@WebServlet` annotation is the empty string. This is
because Tomcat appends this value to the context path. If this annotation had
another value, such as `"foo"`, the servlet path would be `/strcalc/foo`
instead. See: [Stack Overflow: Difference between / and /* in servlet mapping
url pattern](https://stackoverflow.com/questions/4140448/difference-between-and-in-servlet-mapping-url-pattern).

- [Introduction to Servlets](https://www.baeldung.com/intro-to-servlets)
- [Exploring the New HTTP Client in
  Java](https://www.baeldung.com/java-9-http-client)
- [The Java EE 6 Tutorial: Java Servlet
  Technology](https://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html)

### Add a `bin/tomcat-docker.sh` script to launch the [Tomcat Docker image][]

This script can be run manually.

### Add the `LocalServer` test helper

The full path is `com.mike_bland.training.testing.utils.LocalServer`.

This class runs `git` and `docker` commands to emulate the
`bin/tomcat-docker.sh` script on demand for `StringCalculatorServletTest`. A key
difference is that `LocalServer` will allocate a unique port for every test run,
so that it won't conflict with an existing local instance.

## Partitioning tests into small, medium, and large test sizes

### Add the `@SmallTest`, `@MediumTest`, and `@LargeTest` annotations

These are JUnit composed annotations based on the guidance from:

- [JUnit: 2.1.1. Meta-Annotations and Composed
  Annotations](https://junit.org/junit5/docs/current/user-guide/#writing-tests-meta-annotations)

### Add `test-medium`, `test-large`, `test-all` tasks, update `test` and `check`

These tasks and updates use JUnit composed annotations and the `includeTags`
config option based on guidance from:

- [Gradle: Testing in Java & JVM
  projects](https://docs.gradle.org/current/userguide/java_testing.html)
- [Gradle: Authoring
  Tasks](https://docs.gradle.org/current/userguide/more_about_tasks.html)

Note that with no `@SmallTest` methods defined, running the `test` task produces
the following warning:

```none
$ ./gradlew test --warning-mode all --rerun-tasks

[...snip...]

> Task :strcalc:test
No test executed. This behavior has been deprecated. This will fail with an
error in Gradle 9.0. There are test sources present but no test was executed.
Please check your test configuration. Consult the upgrading guide for further
information:
https://docs.gradle.org/8.4/userguide/upgrading_version_8.html#test_task_fail_on_no_test_executed

[...snip...]
```

The same is true for `test-medium` and `test-large` when no `@MediumTest` or
`@LargeTest` methods are present. The `SmallPlaceholderTest` and
`LargePlaceholderTest` classes exist to silence this warning until actual
`@SmallTest` and `@LargeTest` methods appear.

## Adding the `/strcalc` landing page

### Add `src/main/webapp/index.html` and Hamcrest matchers

Per the [Gradle WAR plugin][], files in `src/main/webapp` are copied to the root
of the servlet WAR file. Adding the `src/main/webapp/index.html` landing page
necessitated two things:

- Updating the `@WebServlet` annotation on `StringCalculatorServlet` from `""`
  to `"/add"`. This enables Tomcat to serve `index.html` as `/strcalc/`, and the
  servlet now serves `/strcalc/add/`.
- Updating the `helloWorldPlaceholder` test method to `landingPageHelloWorld`.
  This test now checks that the response is of [Content-Type][] `text/html`
  instead of `text/plain`, and that it contains `"Hello, World!"`, not that it
  matches exactly.

Changing the test assertion to check that the response body contains `"Hello,
World!"` necessitated using the [Hamcrest matcher library][]. We could've used:

```java
assertTrue(resp.body().contains("Hello, World!"));
```

But when it fails, we get very little information about the problem:

```text
Expected :true
Actual   :false
```

Using the Hamcrest matcher:

```java
assertThat(resp.body(), containsString("Hello, World!"));
```

we're able to see more information:

```text
java.lang.AssertionError:
Expected: a string containing "Hello, World!"
     but: was "<DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>String Calculator - Mike Bland Training</title>
</head>
<body>
<p>Hello, world!</p>
</body>
</html>
"
```

## Setting up continuous integration

Added the [.github/CODEOWNERS](.github/CODEOWNERS) file and
[.github/workflows/run-tests.yaml](.github/workflows/run-tests.yaml) file
for [GitHub Actions][]. Configured using the [setup-java GitHub Actions plugin][].

### Publishing JUnit test results

[run-tests.yaml](.github/workflows/run-tests.yaml) runs `gradlew
merge-test-reports` to aggregate individual `TEST-*.xml` JUnit results files
into `TESTS-TestSuites.xml` files. This task uses [org.apache.ant:ant-junit][]
based on advice from [Merging Per-Suite JUnit Reports into Single File with
Gradle + Kotlin][]. (See also: [Using Ant from Gradle][].)

The aggregated files are uploaded via the [actions/upload-artifact GitHub
Actions plugin][].
[.github/workflows/publish-test-results.yaml](.github/workflows/publish-test-results.yaml)
then uses the [actions/download-artifact GitHub Actions plugin][] to retrieve
the results and pass them to the [dorny/test-reporter GitHub Actions
plugin][dorny/test-reporter]. That plugin makes the test results for the tested
commit available via the status icon next to the commit hash in the GitHub UI.

As explained by the [dorny/test-reporter][] page, the separate
`publish-test-results.yaml` file is necessary to ensure the plugin has
permission to launch a [check run][]:

> When someone pushes code to the repository, GitHub automatically sends the
> `check_suite` event with an action of `requested` to all GitHub Apps installed
> on the repository that have the `checks:write` permission.

Not having `checks:write` permission for the plugin can lead to the cryptic error:

```text
Error: HttpError: Resource not accessible by integration
```

For more on `GITHUB_TOKEN` permissions, see [Assigning permissions to jobs].

## Adding large tests

Coming soon...

## Implementing core logic using Test Driven Development and unit tests

Coming soon...

## Additional References

- [Building a web application with Gradle](https://openliberty.io/guides/gradle-intro.html)

[String Calculator kata]: https://osherove.com/tdd-kata-1
[Test Pyramid]: https://mike-bland.com/2023/08/31/the-test-pyramid-and-the-chain-reaction.html
[GitHub Actions]: https://github.com/features/actions
[walking skeleton]: https://wiki.c2.com/?WalkingSkeleton
[Selenium WebDriver]: https://www.selenium.dev/documentation/webdriver/
[headless Chrome]: https://developer.chrome.com/blog/headless-chrome/
[Mocha testing framework]: https://mochajs.org/
[Chai assertion library]: https://www.chaijs.com/
[Sinon test double framework]: https://sinonjs.org/
[test doubles]: https://mike-bland.com/2023/09/06/test-doubles.html
[Apache Solr]: https://solr.apache.org/
[HTML &lt;form&gt;]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[Open Source software]: https://opensource.org/osd-annotated
[Mozilla Public License 2.0]: https://www.mozilla.org/MPL/
[Eclipse Temurin&trade; Latest Releases]: https://adoptium.net/temurin/releases/
[SDKMAN!]: https://sdkman.io
[Tomcat servlet container]: https://tomcat.apache.org/
[Tomcat 10.1 Setup instructions]: https://tomcat.apache.org/tomcat-10.1-doc/setup.html
[Create a Java project with Gradle]: https://docs.gradle.org/current/samples/sample_building_java_libraries.html
[Gradle Tutorial]: https://docs.gradle.org/current/userguide/part1_gradle_init.html
[Gradle]: https://gradle.org/
[Gradle compatibility matrix for Java]: https://docs.gradle.org/current/userguide/compatibility.html#java
[Gradle WAR plugin]: https://docs.gradle.org/current/userguide/war_plugin.html
[Jakarta Servlet Specification]: https://jakarta.ee/specifications/servlet/
[IntelliJ IDEA]: https://www.jetbrains.com/idea/
[Visual Studio Code]: https://code.visualstudio.com/
[EListMan]: https://github.com/mbland/elistman
[Go]: https://go.dev/
[Markdown]: https://daringfireball.net/projects/markdown/
[Create Tomcat > Local run configuration]: https://www.baeldung.com/tomcat-deploy-war#1-local-configuration
[Tomcat deployment]: https://tomcat.apache.org/tomcat-10.1-doc/appdev/deployment.html
[JUnit]: https://junit.org/
[Tomcat Docker image]: https://hub.docker.com/_/tomcat
[Content-Type]: https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Type
[Hamcrest matcher library]: https://hamcrest.org
[setup-java GitHub Actions plugin]: https://github.com/actions/setup-java
[org.apache.ant:ant-junit]: https://mvnrepository.com/artifact/org.apache.ant/ant-junit
[Merging Per-Suite JUnit Reports into Single File with Gradle + Kotlin]: https://blog.lehnerpat.com/post/2018-09-10/merging-per-suite-junit-reports-into-single-file-with-gradle-kotlin/
[Using Ant from Gradle]: https://docs.gradle.org/current/userguide/ant.html
[actions/upload-artifact GitHub Actions plugin]: https://github.com/actions/upload-artifact
[actions/download-artifact GitHub Actions plugin]: https://github.com/actions/download-artifact
[dorny/test-reporter]: https://github.com/marketplace/actions/test-reporter
[check run]: https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-ci-checks-with-a-github-app#about-checks
[Assigning permissions to jobs]: https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs
