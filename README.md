# Tomcat Servlet Testing Example

My attempt at an outside-in testing example in Java using a Tomcat servlet
container.

Source: <https://github.com/mbland/tomcat-servlet-testing-example>

[![License](https://img.shields.io/github/license/mbland/tomcat-servlet-testing-example.svg)](https://github.com/mbland/tomcat-servlet-testing-example/blob/main/LICENSE.txt)
[![CI status](https://github.com/mbland/tomcat-servlet-testing-example/actions/workflows/run-tests.yaml/badge.svg)](https://github.com/mbland/tomcat-servlet-testing-example/actions/workflows/run-tests.yaml?branch=main)
[![Test results](https://github.com/mbland/tomcat-servlet-testing-example/actions/workflows/publish-test-results.yaml/badge.svg)](https://github.com/mbland/tomcat-servlet-testing-example/actions/workflows/publish-test-results.yaml?branch=main)
[![Coverage Status](https://coveralls.io/repos/github/mbland/tomcat-servlet-testing-example/badge.svg?branch=main)][coveralls-tste]

This project will eventually incorporate the [String Calculator kata][] to
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
- Replaced the `java-library` plugin in [strcalc/build.gradle.kts][] with
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
<http://localhost:8080/strcalc> to return this value.

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
`bin/tomcat-docker.sh` script on demand for
`StringCalculatorTomcatContractTest`. A key difference is that `LocalServer`
will allocate a unique port for every test run, so that it won't conflict with
an existing local instance.

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

<!-- markdownlint-disable-next-line MD033 -->
### <a name="gradle-targets"></a>Use IntelliJ IDEA Gradle integration to define run configurations for test targets

After syncing the Gradle project, you can use IntelliJ IDEA's Gradle integration
to convert the Gradle test tasks from [strcalc/build.gradle.kts][] directly into
[IntelliJ run configurations][]:

- Navigate to **View > Tool Windows > Gradle** _or_ click the Gradle elephant
  logo in the right side toolbar to open the Gradle tool window.
- Navigate through the Gradle project hierarchy and select the target you'd like
  to turn into a run configuration, e.g., `test`.
- Double click the target or hit enter/return to create and run the run
  configuration for that target.
- Open the run configuration and modify it as desired.

#### Benefits

Doing this instead of creating a typical [JUnit run configuration][] ensures
that IntelliJ runs the same tests the same way as the `gradlew` command. This,
in turn, helps ensure that IntelliJ runs the same tests the same way as they're
run in continuous integration. This includes running with the same code coverage
configuration and output. See **[Setting up continuous integration](#ci)**
below.

You _can_ still create JUnit run configurations, but these `gradlew` targets
already ensure that all dependencies of the task are built first. This is
particularly helpful when it comes to medium and large tests.

- Specifically for this project, the medium and large tests depend on the
  `strcalc.war` artifact, used to build a temporary Tomcat Docker image for
  testing. The Gradle test tasks are already configured to depend on the `war`
  task.

- Setting this up in a JUnit run configuration would require setting up
  **Modify options** (&#x2325;M) > **Before Launch: Add before launch task** >
  **Run Gradle task**.

Code coverage is always generated for these targets (though not automatically
displayed) when using the regular **Run** command. To display this output, see
[Showing JaCoCo coverage generated by Gradle tasks](#gradle-coverage).

#### Drawbacks

Viewing the coverage generated by the Gradle `test` task in IntelliJ may or may
not work. See the **[Viewing code coverage in IntelliJ IDEA](#idea-coverage)**
section below.

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

<!-- markdownlint-disable-next-line MD033 -->
## <a name="ci"></a>Setting up continuous integration using [GitHub Actions][]

Added the [.github/CODEOWNERS](.github/CODEOWNERS) file and
[.github/workflows/run-tests.yaml](.github/workflows/run-tests.yaml) file
for [GitHub Actions][]. Configured using the [setup-java GitHub Actions
plugin][] and the [gradle/gradle-build-action GitHub Actions plugin][].

### Publishing JUnit test results

[run-tests.yaml](.github/workflows/run-tests.yaml) runs `gradlew
merge-test-reports` to aggregate individual `TEST-*.xml` JUnit results files
into `TESTS-TestSuites.xml` files. This task uses [org.apache.ant:ant-junit][]
based on advice from [Merging Per-Suite JUnit Reports into Single File with
Gradle + Kotlin][]. (See also: [Using Ant from Gradle][].)

The aggregated files are uploaded via the [actions/upload-artifact GitHub
Actions plugin][].
[.github/workflows/publish-test-results.yaml](.github/workflows/publish-test-results.yaml)
then uses the [dorny/test-reporter GitHub Actions plugin][dorny/test-reporter].
That plugin downloads the test results and makes them available via the status
icon next to the commit hash in the GitHub UI.

As explained by the [dorny/test-reporter][] page, the separate
`publish-test-results.yaml` file is necessary to ensure the plugin has
permission to launch a [check run][]:

> When someone pushes code to the repository, GitHub automatically sends the
> `check_suite` event with an action of `requested` to all GitHub Apps installed
> on the repository that have the `checks: write` permission.

Not having `checks:write` permission for the plugin can lead to the cryptic error:

```text
Error: HttpError: Resource not accessible by integration
```

For more on `GITHUB_TOKEN` permissions, see [Assigning permissions to jobs].

## Setting up code coverage

**Code coverage** shows which lines of code are executed by a test or test suite
and which aren't. It is one common and important component of a suite of [Vital
Signs][] to ensure high code and software quality.

[JaCoCo][] (i.e., **Ja**va **Co**de **Co**verage) is a popular framework for
collecting code coverage in Java. IntelliJ IDEA can display code coverage
statistics and display which lines are covered, partially covered, and
uncovered. It can generate and consume JaCoCo coverage in addition to its own
builtin coverage implementation.

### Code coverage guidelines

- Code coverage does _not_ indicate that you have enough tests, or that your
  tests are any good, or they're validating what you expect they are. It _can_
  definitively tell whether specific code is exercised by a test (or any test at
  all), which could reveal gaps in your test suite. Used skillfully, it can be
  of great use in the process of [refactoring][], making small changes that
  improve code quality while preserving behavior. (Using code coverage in this
  way requires a set of techniques that I hope to cover in their own separate
  training module(s).)

- The ideal is to have high code coverage from your entire small (or small-ish)
  test suite. Each test should cover relatively little, very specific areas of
  the code. Larger tests should _not_ generate code coverage, as such tests by
  definition will execute broader areas of the code, diluting the value of the
  measurements.

  The way to think about this is to think of the information available when a
  smaller test fails versus a larger test:

  - When a smaller test fails, the potential area of the code responsible for
    the failure is fairly narrow.

  - When a larger test fails, the potential area of the code responsible for the
    failure is potentially the entire application.

- Also consider the time required to run them: Smaller tests run multiple orders
  of magnitude faster than larger tests. Having high code coverage from a suite
  of highly targeted smaller tests that you can run frequently while developing
  enables [tighter feedback and recovery loops][feedback-loops]. This translates
  into higher confidence and faster velocity.

  On the contrary, larger tests have a broader scope, consume more resources,
  and run more slowly. While still critically important, these qualities make
  running larger tests frequently while coding impractical. They should be used
  sparingly to validate higher level systemic properties, as using them to
  validate lower level details renders them brittle.

  Therefore, code coverage from larger tests does practically nothing to tighten
  feedback loops and to help resolve coding errors quickly, rendering it far
  less useful.

- That said, if you do choose to collect code coverage from all tests, take care
  to partition the reports by test size. Coverage from the larger test suites
  should be less than or equal to that from the smaller test
  suite&mdash;_**not** the other way around!_

  Relying on code coverage percentages inflated by coverage from large tests
  risks instilling a false sense of security. It could potentially mask gaps in
  smaller test coverage that could in turn mask serious, yet preventable
  problems.

### Enabling the [Gradle JaCoCo Plugin][] and generating HTML and XML reports

Adding the [Gradle JaCoCo Plugin][] to the [strcalc/build.gradle.kts][] file was
straightforward. With the plugin enabled, the `test` task automatically
generates JaCoCo coverage data at `strcalc/build/jacoco/test.exec`. Then the
`jacocoTestReport` task creates an HTML report viewable via:

```sh
open -a safari strcalc/build/reports/jacoco/test/html/index.html
```

The `jacocoXmlTestReport` task generates an XML report which our [GitHub Actions
continuous integration system](#ci) will publish. For details on publishing
options, see:

- [Publishing continuous integration coverage results to Coveralls](#cov-ci-coveralls)
- [Alternate coverage reporting](#cov-ci-alt)

<!-- markdownlint-disable-next-line MD033 -->
### <a name="idea-coverage"></a>Viewing code coverage in IntelliJ IDEA

The options for viewing code coverage directly in IntelliJ IDEA include:

- _Using a run configuration to generate and display code coverage_
- _Showing JaCoCo coverage generated by Gradle tasks_

For information on IntelliJ's code coverage options and operations beyond what's
described below, see [IntelliJ Idea: Code coverage][].

#### Using a run configuration to generate and display code coverage

IntelliJ allows you to configure specific run configurations to generate and
display code coverage via **Run > Run CONFIGURATION_NAME with Coverage**. It
allows you to use wither JaCoCo or IntelliJ's own builtin code coverage
implementation. You can configure the [Gradle run
configurations](#gradle-targets) or any [JUnit run configuration][] you define
yourself.

For instructions, see [IntelliJ: Run with coverage][].

- **_NOTE as of 2023-11-05_**: For now, I recommend configuring your run
  configurations to use IntelliJ's builtin coverage implementation. See the
  [JaCoCo and Java version compatibility between the project and
  IntelliJ](#cov-compat) section below for details.

<!-- markdownlint-disable-next-line MD033 -->
#### <a name="gradle-coverage"></a>Showing JaCoCo coverage generated by Gradle tasks

The JaCoCo coverage results automatically generated by the Gradle test tasks
won't automatically display in IntelliJ, but you can import them. The [IntelliJ
IDEA: Manage coverage suites][] documentation covers most of the process, but
specifically for this project:

- Open **Run > Show Coverage Data...** (&#x2325;&#x2318;F6) to open the **Choose
  Coverage Suite to Display** window.
- Click the **+** symbol to open the file picker.
- Select `strcalc/build/jacoco/test.exec` and click the **Open** button.
- Make sure the **JaCoCo Coverage > test.exec** item is checked and click the
  **Show Selected** button.

Code coverage markers should now appear in the left gutter of the code editor of
each `src/main/java` file (green for covered, red for uncovered).

- **If no coverage markers appear**, see the [JaCoCo and Java version
  compatibility between the project and IntelliJ](#cov-compat) section below.

- **_NOTE as of 2023-11-05_**: The coverage markers from this process _won't_
  appear in IntelliJ for this project at present.

### IntelliJ IDEA code coverage display details

Here are a few fine details to be aware of:

- The coverage percentage reported from IntelliJ's builtin coverage reporter
  will differ from JaCoCo's slightly, as documented in:

  - [Stack Overflow: Why do Intellij code coverage and jacoco code coverage show
    different percentages?][]

  As mentioned in that answer, it's not that one version is wrong and the other
  is right. Differences in implementation account for differences in reported
  percentages, particularly when it comes to differences in counting implicitly
  generated methods. Both will still show which code is or isn't covered in
  every source file.

- However, the **Principle of Least Surprise** could apply here. Relying on
  JaCoCo's results is likely to avoid misunderstandings between coverage
  percentages reported in IntelliJ and from command line and continuous
  integration runs.

- The **Run > Show Coverage Data...** (&#x2325;&#x2318;F6) option actually
  allows you to show _both_ IntelliJ and JaCoCo coverage results together, or to
  switch between them. It also allows you to select `.exec` files from different
  Gradle subprojects and test targets, as well as coverage from different run
  configurations in general.

<!-- markdownlint-disable-next-line MD033 -->
#### <a name="cov-compat"></a> JaCoCo and Java version compatibility between the project and IntelliJ

The JaCoCo version bundled with IntelliJ may not be the latest available. This
can prevent JaCoCo coverage from appearing in IntelliJ if your project uses a
newer version of Java than the builtin JaCoCo version can support. There appears
to be no way for users to update the JaCoCo version bundled with IntelliJ.

- As of 2023-11-05, this project uses Java 21.0.1-temurin and JaCoCo 0.8.11
  (defined in [strcalc/build.gradle.kts][]). Per the [JaCoCo Change History][]
  and the following mailing list message, Java 21 requires at least JaCoCo
  0.8.9:

  - [Re: &#x5b;java code coverage&#x5d; Java 21 supported?][]

  However, my current IntelliJ IDEA version 2023.2.4 ships with JaCoCo
  0.8.8.202204050719/5dcf34a. There's an open issue requesting an upgrade to
  v0.8.11:

  - [YouTrack: Update bundled JaCoCo to latest version (0.8.11) to support Java
    21][yt-jacoco]

**If you encounter this problem, I recommend using IntelliJ's builtin in
coverage in your run configurations until a new IntelliJ release resolves the
issue.** Just be aware, as noted above, that while the reported percentages may
differ from JaCoCo, the code editor coverage markings should be largely the
same.

##### Diagnosis

This problem will manifest by producing output similar to the following (edited
for readability) when using:

- **Run > Run CONFIGURATION_NAME with Coverage**: this output will appear in the
output pane

- **Run > Show Coverage Data...** (&#x2325;&#x2318;F6): this output
  will appear in the IntelliJ debug log. You can find this log via: **Help >
  Show Log in Finder**.

  Note that _this problem will not produce a modal error window!_ If all the
  percentages in the **Coverage** pane show `100% (0/0)`, this is likely the
  culprit.

```text
2023-11-05 14:47:39,944 [6679894]   INFO - #c.i.c.JaCoCoCoverageRunner -
Error while analyzing .../strcalc/build/classes/java/.../*.class
with JaCoCo 0.8.8.202204050719/5dcf34a.

java.io.IOException:
Error while analyzing .../strcalc/build/classes/java/.../*.class
with JaCoCo 0.8.8.202204050719/5dcf34a.
  at org.jacoco.core.analysis.Analyzer.analyzerError(Analyzer.java:163)
  at org.jacoco.core.analysis.Analyzer.analyzeClass(Analyzer.java:135)
  [ ...snip... ]

Caused by: java.lang.IllegalArgumentException:
Unsupported class file major version 65
  at org.objectweb.asm.ClassReader.<init>(ClassReader.java:199)
  at org.objectweb.asm.ClassReader.<init>(ClassReader.java:180)
  [ ...snip... ]
```

<!-- markdownlint-disable-next-line MD033 -->
### <a name="cov-ci-coveralls"></a>Publishing continuous integration coverage results to [Coveralls][]

[Coveralls][] is a commercial product for visualizing current code coverage and
historical trends. It's free for all open source projects, and offers pricing
tiers for commercial customers. See the [tomcat-servlet-testing-example
Coveralls report][coveralls-tste] (also linked from the **coverage** badge at
the top of this file) to see Coveralls in action.

The [continuous integration](#ci) system publishes JaCoCo code coverage results
to Coveralls using the [coverallsapp/github-action GitHub Actions plugin][].
Coveralls will make the coverage results for the tested commit available via the
status icon next to the commit hash in the GitHub UI. It will also add comments
to pull requests summarizing how the changes affect code coverage.

<!-- markdownlint-disable-next-line MD033 -->
### <a name="cov-ci-alt"></a>Alternative coverage reporting

If you prefer not to use Coveralls, you can search the [GitHub Actions
marketplace][] for [JaCoCo related GitHub Actions plugins][]. A couple of
promising ones are:

- [Madrapps/jacoco-report](https://github.com/marketplace/actions/jacoco-report)
- [PavanMudigonda/jacoco-reporter](https://github.com/marketplace/actions/jacoco-reporter)

Note that, though the instructions of neither of the above plugins show it, you
may need to split the configuration similarly to the [dorny/test-reporter][]
plugin:

- Use the [actions/upload-artifact GitHub Actions plugin][] at the end of the
  [.github/workflows/run-tests.yaml](.github/workflows/run-tests.yaml) file to upload
  `strcalc/build/reports/jacoco/jacocoXmlTestReport/jacocoXmlTestReport.xml`.
- Set the `checks: write` permission in
  [.github/workflows/publish-test-results.yaml](.github/workflows/publish-test-results.yaml)
  so the coverage results can be posted as part of a [check run][].
- Use the [actions/download-artifact GitHub Actions plugin][] in the
  [.github/workflows/publish-test-results.yaml](.github/workflows/publish-test-results.yaml)
  file to download the report.
- Configure the selected plugin to process the downloaded
`jacocoXmlTestReport.xml` file.

## Adding large tests

Coming soon...

## Implementing core logic using Test Driven Development and unit tests

Coming soon...

## Additional References

- [Building a web application with Gradle](https://openliberty.io/guides/gradle-intro.html)

[coveralls-tste]: https://coveralls.io/github/mbland/tomcat-servlet-testing-example?branch=main
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
[strcalc/build.gradle.kts]: strcalc/build.gradle.kts
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
[JUnit run configuration]: https://www.jetbrains.com/help/idea/run-debug-configuration-junit.html
[Create Tomcat > Local run configuration]: https://www.baeldung.com/tomcat-deploy-war#1-local-configuration
[Tomcat deployment]: https://tomcat.apache.org/tomcat-10.1-doc/appdev/deployment.html
[JUnit]: https://junit.org/
[Tomcat Docker image]: https://hub.docker.com/_/tomcat
[IntelliJ run configurations]: https://www.jetbrains.com/help/idea/run-debug-configuration.html
[Content-Type]: https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Type
[Hamcrest matcher library]: https://hamcrest.org
[setup-java GitHub Actions plugin]: https://github.com/actions/setup-java
[gradle/gradle-build-action GitHub Actions plugin]: https://github.com/gradle/gradle-build-action
[org.apache.ant:ant-junit]: https://mvnrepository.com/artifact/org.apache.ant/ant-junit
[Merging Per-Suite JUnit Reports into Single File with Gradle + Kotlin]: https://blog.lehnerpat.com/post/2018-09-10/merging-per-suite-junit-reports-into-single-file-with-gradle-kotlin/
[Using Ant from Gradle]: https://docs.gradle.org/current/userguide/ant.html
[actions/upload-artifact GitHub Actions plugin]: https://github.com/actions/upload-artifact
[actions/download-artifact GitHub Actions plugin]: https://github.com/actions/download-artifact
[dorny/test-reporter]: https://github.com/marketplace/actions/test-reporter
[check run]: https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-ci-checks-with-a-github-app#about-checks
[Assigning permissions to jobs]: https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs
[feedback-loops]: https://youtu.be/YrgJL5SFHbM
[JaCoCo]: https://www.jacoco.org/jacoco/
[Vital Signs]: https://mike-bland.com/2023/09/18/vital-signs-reveal-the-matrix.html
[refactoring]: https://refactoring.com/
[Gradle JaCoCo plugin]: https://docs.gradle.org/current/userguide/jacoco_plugin.html
[IntelliJ IDEA: Manage coverage suites]: https://www.jetbrains.com/help/idea/switching-between-code-coverage-suites.html
[IntelliJ Idea: Code coverage]: https://www.jetbrains.com/help/idea/code-coverage.html
[IntelliJ: Run with coverage]: https://www.jetbrains.com/help/idea/running-test-with-coverage.html
[Stack Overflow: Why do Intellij code coverage and jacoco code coverage show different percentages?]: https://stackoverflow.com/a/65350024
[JaCoCo Change History]: https://www.jacoco.org/jacoco/trunk/doc/changes.html
[Re: &#x5b;java code coverage&#x5d; Java 21 supported?]: https://www.mail-archive.com/jacoco@googlegroups.com/msg05287.html
[yt-jacoco]: https://youtrack.jetbrains.com/issue/IDEA-336978
[Coveralls]: https://coveralls.io/
[coverallsapp/github-action GitHub Actions plugin]: https://github.com/coverallsapp/github-action
[GitHub Actions marketplace]: https://github.com/marketplace?type=actions
[JaCoCo related GitHub Actions plugins]: https://github.com/marketplace?category=&type=actions&verification=&query=jacoco
