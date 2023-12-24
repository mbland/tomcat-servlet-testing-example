/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.utils;

import com.mike_bland.training.testing.stringcalculator.Servlet;
import jakarta.servlet.annotation.WebServlet;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.core.StandardContext;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.webresources.DirResourceSet;
import org.apache.catalina.webresources.StandardRoot;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;

// Based on:
// - https://www.infoworld.com/article/3510460/what-is-apache-tomcat-the-original-java-servlet-container.amp.html
// - https://devcenter.heroku.com/articles/create-a-java-web-application-using-embedded-tomcat
//
// API doc:
// - https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html
public class TestTomcat {
    // Files copied directly into the WAR, including META-INF and WEB-INF dirs.
    public static final String WEB_APP_SRC_DIR =
            new File("src/main/webapp").getAbsolutePath();

    // Files copied directly into the WAR produced by the frontend build.
    public static final String WEB_APP_BUILD_DIR =
            new File("build/webapp").getAbsolutePath();

    // Compiled classes packaged into the WAR file.
    public static final String WEB_INF_CLASSES =
            new File("build/classes/java/main").getAbsolutePath();

    // Directory containing WAR files.
    public static String WEB_APP_WAR_DIR =
            new File("build/libs").getAbsolutePath();

    private final int port;
    private final String contextPath;
    private final URI uri;
    private final File baseDir;
    private Tomcat tomcat;
    private boolean running;

    public TestTomcat(int port, String contextPath)
            throws IllegalArgumentException {
        this.port = port;
        this.contextPath = validateContextPath(contextPath);
        this.uri = URI.create(
                String.format("http://localhost:%d%s", port, contextPath)
        );
        this.baseDir = new File("build/test-tomcat-basedir");
    }

    // Starts Tomcat using the default WEBAPP_CONFIG.
    //
    // Note that this will run roughly 30x-40x slower than the start(Servlet)
    // variant. This is because it:
    //
    // - reads configs from WEB_APP_SRC_DIR,
    // - loads classes from WEB_INF_CLASSES,
    // - registers artifacts from WEB_APP_BUILD_DIR, and
    // - starts Weld to inject dependencies.
    //
    // The start(Servlet) variant does none of this, because it registers a
    // fully constructed Servlet directly from memory.
    public void startWithBuildInputs() throws LifecycleException {
        startImpl(() -> {
            // Needed by CDI/Weld; avoids the following warning emitted during
            // TestTomcat.stop() (where the "/..." in "StandardContext[/...]" is
            // replaced by the servlet endpoint):
            //
            //   org.apache.catalina.deploy.NamingResourcesImpl cleanUp
            //   WARNING: Failed to retrieve JNDI naming context for container
            //     [StandardEngine[Tomcat].StandardHost[localhost]
            //     .StandardContext[/...]] so no cleanup was performed for that
            //     container
            //   javax.naming.NamingException: No naming context bound to this
            //     class loader
            //     at org.apache.naming.ContextBindings.getClassLoader(...)
            //     [...snip...]
            tomcat.enableNaming();

            final var ctx = (StandardContext) tomcat.addWebapp(
                    contextPath, WEB_APP_SRC_DIR
            );
            final var root = new StandardRoot(ctx);
            root.addPreResources(new DirResourceSet(
                    root,
                    "/WEB-INF/classes",
                    WEB_INF_CLASSES,
                    "/"
            ));
            final var frontendArtifacts = new DirResourceSet(
                    root,
                    "/",
                    WEB_APP_BUILD_DIR,
                    "/"
            );

            root.addPreResources(frontendArtifacts);
            ctx.setResources(root);
            return ctx;
        });
    }

    // Starts Tomcat using the supplied Servlet.
    //
    // Note that this will run roughly 30x-40x faster than the start() variant.
    // See that variant's comments for an explanation.
    public void start(Servlet servlet) throws LifecycleException {
        startImpl(() -> {
            var ctx = tomcat.addContext(contextPath, WEB_APP_BUILD_DIR);
            var name = servlet.getClass().getSimpleName();

            // This can be generalized to get other @WebServlet properties.
            // For now, we're keeping it straightforward for teaching purposes.
            var annotation = servlet.getClass().getAnnotation(WebServlet.class);
            var endpoint = annotation.value()[0];

            tomcat.addServlet(contextPath, name, servlet);
            ctx.addServletMappingDecoded(endpoint, name);
            return (StandardContext) ctx;
        });
    }

    // Starts Tomcat using the fully compiled WAR file.
    public void startWithWarFile(String warFile)
            throws LifecycleException, IOException {
        final var warPath = new File(WEB_APP_WAR_DIR, warFile);
        final var warUrl = warPath.toURI().toURL();

        if (!warPath.exists()) {
            throw new FileNotFoundException("WAR file not found: " + warPath);
        }

        startImpl(() -> {
            // addWebapp will die with a FileNotFound error if this directory
            // doesn't already exist.
            final var baseDir = tomcat.getHost().getAppBaseFile();

            if (!baseDir.exists() && !baseDir.mkdir()) {
                final var m = "failed to create app dir for copied WAR file: ";
                throw new IOException(m + baseDir);
            }
            tomcat.enableNaming();
            return (StandardContext) tomcat.addWebapp(contextPath, warUrl);
        });
    }

    private interface StandardContextProvider {
        StandardContext get() throws LifecycleException, IOException;
    }

    private synchronized void startImpl(StandardContextProvider servletCtx)
            throws LifecycleException {
        if (running) return;
        running = true;
        tomcat = new Tomcat();
        tomcat.setBaseDir(this.baseDir.getAbsolutePath());
        tomcat.setPort(port);
        tomcat.setSilent(true);

        try {
            disableChecks(servletCtx.get());
        } catch (Exception e) {
            throw new LifecycleException(e);
        }

        // getConnector() is a recent requirement the other examples didn't use.
        // - https://stackoverflow.com/questions/15114892/embedded-tomcat-without-web-inf#comment98210881_15235711
        // - https://stackoverflow.com/a/49011424
        tomcat.getConnector();
        tomcat.start();
    }

    private static void disableChecks(StandardContext ctx) {
        ctx.setClearReferencesThreadLocals(false);
        ctx.setClearReferencesRmiTargets(false);

        // Prevent deleteBaseDir() failures on Windows, thanks to:
        // - https://stackoverflow.com/a/20757153
        ctx.setAntiResourceLocking(true);
    }

    public URI resolveEndpoint(String endpoint)
        throws IllegalArgumentException {
        if (!endpoint.startsWith("/")) {
            final var msg = "endpoint path should begin with '/', got: \"%s\"";
            throw new IllegalArgumentException(msg.formatted(endpoint));
        }
        return uri.resolve("%s%s".formatted(contextPath, endpoint));
    }

    public synchronized void stop() throws LifecycleException, IOException {
        if (!running) return;
        running = false;
        tomcat.stop();
        tomcat.destroy();
        deleteBaseDir(this.baseDir);
    }

    private static String validateContextPath(String contextPath)
        throws IllegalArgumentException {
        if (!contextPath.equals("/") &&
            (!contextPath.startsWith("/") || contextPath.endsWith("/"))) {
            final var msg = "contextPath should be '/' or start with '/', " +
                            "but not end with '/', got: \"%s\"";
            throw new IllegalArgumentException(msg.formatted(contextPath));
        }
        return contextPath;
    }

    private static void deleteBaseDir(File baseDir) throws IOException {
        List<String> failed;

        try (var fileStream = Files.walk(baseDir.toPath())) {
            failed = fileStream.map(Path::toFile)
                    .sorted(Comparator.reverseOrder())
                    .filter(f -> !f.delete())
                    .map(File::toString)
                    .toList();
        }

        if (!failed.isEmpty()) {
            final var msg = "failed to delete Tomcat working dir(s):\n  %s";
            throw new IOException(
                    msg.formatted(String.join("\n  ", failed))
            );
        }
    }
}
