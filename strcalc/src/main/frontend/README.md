# Tomcat Servlet Testing Example Frontend

This is the frontend component of the [mbland/tomcat-servlet-testing-example][]
project. For details on the larger project and the backend component, see the
[top level README.md][].

The Java environment isn't strictly required to develop, build, and test the
frontend in isolation. Conversely, the frontend environment isn't required for
`./gradlew test`, which runs the small Java unit tests from the exercise.

However, you will need to have both environments installed to build most of the
Gradle targets. This includes the medium integration and large system tests in
`strcalc/src/test/java`, which also depend on the frontend build.

## Setup frontend JavaScript environment

[Node.js][] is a JavaScript runtime environment. [pnpm][] is a Node.js package
manager.

- TODO(mbland): Document usage of [nodenv][], [Homebrew][]

[ESLint][] is a tool for formatting and linting JavaScript code.

[Vite][] is a JavaScript development and deployment platform. [Vitest][] is a
JavaScript test framework and runner designed to work well with Vite.

Though I've had a great experience testing with Mocha, Chai, and Sinon in the
past, setting them up involves a bit more work.

- [Mocha test framework][]
- [Chai test assertion library][]
- [Sinon test double framework][]

In contrast, Vitest is largely modeled after the popular Jest framework and is a
breeze to set up, especially for existing Vite projects. Like Jest, it contains
its own assertion library and test double framework.  For the purpose of a
teaching example for people who may never have tested JavaScript before, but
aren't using React, Vitest seems much more accessible.

Suffice it to say, ESLint and Vite have IntelliJ IDEA and Visual Studio
Code support:

- ESLint in IntelliJ IDEA: _Settings > Languages & Frameworks >
  JavaScript > Code Quality Tools > ESLint_
- [ESLint extension for Visual Studio Code][]
- [Vite IntelliJ plugin][]
- [Vite extension for Visual Studio Code][]

## JSDoc documentation

The inline documentation is written using the [JSDoc][] format. [IntelliJ IDEA][]
and [Visual Studio Code][] both support JSDoc natively, so there's no need to
install any extra tools.

However, if you want to generate the HTML version of the documentation, you can run:

```sh
# If you've never installed a global package with pnpm before
# - https://pnpm.io/cli/setup
$ pnpm setup
[...snip...]

# Install JSDoc globally
$ pnpm add -g jsdoc
[...snip...]

# Run the "jsdoc" script from package.json, where "0.0.0" is whatever the
# current version is now
$ pnpm jsdoc

> tomcat-servlet-testing-example-frontend@0.0.0 jsdoc .../tomcat-servlet-testing-example/strcalc/src/main/frontend
> bin/jsdoc -c ./jsdoc.json .

../../../build/jsdoc/tomcat-servlet-testing-example-frontend/0.0.0/index.html
```

To open the resulting file on macOS, Linux, or a [Bash][]-based environment on
Windows (e.g., [Git for Windows][], [MSYS2][]):

```sh
open ../../../build/jsdoc/tomcat-servlet-testing-example-frontend/0.0.0/index.html
```

On [Windows Subsystem for Linux][]:

```sh
# If you haven't installed the Windows Subsystem for Linux Utilities
sudo apt install wslu

# Once WSLU is installed
wslview ../../../build/jsdoc/tomcat-servlet-testing-example-frontend/0.0.0/index.html
```

To open it in the [Windows Command Prompt][] or [PowerShell][], just enter the
path directly at the prompt, or prefix it with [`start`][]:

```bat
..\..\..\build\jsdoc\tomcat-servlet-testing-example-frontend\0.0.0\index.html
```

### JSDoc eslint plugin

Note that this project uses [eslint-plugin-jsdoc][] to enforce JSDoc style rules.

### JSDoc quirk

JSDoc can't yet handle objects defined in an `export default` declaration
without the `@function` tag:

- <https://github.com/jsdoc/jsdoc/issues/1539>
- <https://github.com/jsdoc/jsdoc/issues/2038>

When that bug gets fixed, I'll remove this comment and the explicit `@function`
decorators.

## Optional: Use local repo for Vitest packages

The current version of Vitest breaks on this project because `config.base` is
specified in `vite.config.js`. See:

- https://github.com/vitest-dev/vitest/issues/4686

Once the following pull request is merged and released, we can release the
revlock and upgrade both Vite and Vitest:

- https://github.com/vitest-dev/vitest/pull/4692

In the meanwhile, I'm publishing this fix in my **mbland/vitest** fork using
tags of the format `v1.0.2-mbland.0`:

- https://github.com/mbland/vitest/tree/v1.0.2-mbland.0

To use this package, first clone it and build it in the same parent directory
containing this repository, replacing `v1.0.2-mbland.0` with the latest tag:

```sh
git clone git@github.com:mbland/vitest.git
cd vitest
git reset --hard v1.0.2-mbland.0
pnpm i
pnpm build
cd packages/browser
pnpm pack
```

Then apply changes like the following to `package.json`, followed by `pnpm i`:

```diff
diff --git a/strcalc/src/main/frontend/package.json b/strcalc/src/main/frontend/package.json
index be373d8..7039359 100644
--- a/strcalc/src/main/frontend/package.json
+++ b/strcalc/src/main/frontend/package.json
@@ -34,17 +34,17 @@
   "devDependencies": {
     "@rollup/pluginutils": "^5.1.0",
     "@stylistic/eslint-plugin-js": "^1.5.0",
-    "@vitest/browser": "1.0.0-beta.4",
-    "@vitest/coverage-istanbul": "1.0.0-beta.4",
-    "@vitest/coverage-v8": "1.0.0-beta.4",
-    "@vitest/ui": "1.0.0-beta.4",
+    "@vitest/browser": "file:../../../../../vitest/packages/browser/vitest-browser-1.0.2.tgz",
+    "@vitest/coverage-istanbul": "1.0.2",
+    "@vitest/coverage-v8": "1.0.2",
+    "@vitest/ui": "1.0.2",
     "eslint": "^8.55.0",
     "eslint-plugin-jsdoc": "^46.9.0",
     "eslint-plugin-vitest": "^0.3.10",
     "handlebars": "^4.7.8",
     "jsdom": "^23.0.1",
-    "vite": "^4.5.1",
-    "vitest": "1.0.0-beta.4",
+    "vite": "^5.0.7",
+    "vitest": "1.0.2",
     "webdriverio": "^8.26.0"
   }
 }
```

You'll need to be careful not to commit these changes. You can `git stash` them
or run `git reset --hard head`, followed by `pnpm i` to match the CI build
again.

[mbland/tomcat-servlet-testing-example]: https://github.com/mbland/tomcat-servlet-testing-example
[top level README.md]: ../../../../README.md
[Node.js]: https://nodejs.org/
[pnpm]: https://pnpm.io/
[nodenv]: https://github.com/nodenv/nodenv
[homebrew]: https://brew.sh/
[ESLint]: https://eslint.style/
[Vite]: https://vitejs.dev/
[Vitest]: https://vitest.dev/
[Mocha test framework]: https://mochajs.org/
[Chai test assertion library]: https://www.chaijs.com/
[Sinon test double framework]: https://sinonjs.org/
[ESLint extension for Visual Studio Code]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[Vite IntelliJ plugin]: https://plugins.jetbrains.com/plugin/20011-vite
[Vite extension for Visual Studio Code]: https://marketplace.visualstudio.com/items?itemName=antfu.vite
[JSDoc]: https://jsdoc.app/
[IntelliJ IDEA]: https://www.jetbrains.com/idea/
[Visual Studio Code]: https://code.visualstudio.com/
[Bash]: https://www.gnu.org/software/bash/
[Git for Windows]: https://git-scm.com/download/win
[MSYS2]: https://www.msys2.org/
[Windows Subsystem for Linux]: https://learn.microsoft.com/windows/wsl/
[Windows Command Prompt]: https://learn.microsoft.com/windows-server/administration/windows-commands/windows-commands
[PowerShell]: https://learn.microsoft.com/powershell/
[`start`]: https://learn.microsoft.com/windows-server/administration/windows-commands/start
[eslint-plugin-jsdoc]: https://www.npmjs.com/package/eslint-plugin-jsdoc
