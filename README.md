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

- Creating a [walking skeleton][] implementation and adding a large end-to-end
  test to validate it, likely using [Selenium WebDriver][].
- Developing the String Calculator using TDD and small unit tests.
- Adding a medium integration test to ensure the Servlet passes parameters to
  the internal String Calculator logic and passes back the results.
- Adding unit tests for JavaScript components, likely incorporating the [Mocha
  testing framework][], [Chai assertion library][], and [Sinon test double framework][].
- Using test doubles in unit tests. This may involve extending the String
  Calculator example or adding a completely different one.

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

## Setup

### Install the Java Development Kit

I installed the latest JDK 21.0.1 from [Eclipse Temurin&trade; Latest
Releases][] via [SDKMAN!][].

### Install the [Tomcat servlet container][]

I followed the [Tomcat 10.1 Setup instructions][] to install Tomcat locally
at `/opt/tomcat/apache-tomcat-10.1.15`. I created `bin/tomcat.sh` as a thin
wrapper around Tomcat's `bin/catalina.sh` that detects and sets `JAVA_HOME`
and sets `CATALINA_HOME`. Verified that it was installed correctly via `bin/tomcat.sh start` and visiting <http://localhost:8080/>.

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

## Additional References

- [Building a web application with Gradle](https://openliberty.io/guides/gradle-intro.html)

[String Calculator kata]: https://osherove.com/tdd-kata-1
[Test Pyramid]: https://mike-bland.com/2023/08/31/the-test-pyramid-and-the-chain-reaction.html
[Selenium WebDriver]: https://www.selenium.dev/documentation/webdriver/
[walking skeleton]: https://wiki.c2.com/?WalkingSkeleton
[Mocha testing framework]: https://mochajs.org/
[Chai assertion library]: https://www.chaijs.com/
[Sinon test double framework]: https://sinonjs.org/
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
