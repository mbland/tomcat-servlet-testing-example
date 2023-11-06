/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.utils;

import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.webresources.DirResourceSet;
import org.apache.catalina.webresources.StandardRoot;

import java.io.File;
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
    public static final String WEB_APP_DIR =
            new File("src/main/webapp").getAbsolutePath();
    public static final String WEB_INF_CLASSES =
            new File("build/classes/java/main").getAbsolutePath();

    private final int port;
    private final String contextPath;
    private final URI uri;
    private Tomcat tomcat;
    private boolean running;

    public TestTomcat(int port, String contextPath) {
        this.port = port;
        this.contextPath = contextPath;
        this.uri = URI.create(
                String.format("http://localhost:%d%s", port, contextPath)
        );
    }

    public synchronized void start() throws LifecycleException {
        if (running) return;
        running = true;
        tomcat = new Tomcat();
        tomcat.setPort(port);

        final var ctx = tomcat.addWebapp(contextPath, WEB_APP_DIR);
        final var root = new StandardRoot(ctx);
        final var resourceSet = new DirResourceSet(
                root,
                "/WEB-INF/classes",
                WEB_INF_CLASSES,
                "/"
        );

        root.addPreResources(resourceSet);
        ctx.setResources(root);

        // getConnector() is a recent requirement the other examples didn't use.
        // - https://stackoverflow.com/questions/15114892/embedded-tomcat-without-web-inf#comment98210881_15235711
        // - https://stackoverflow.com/a/49011424
        tomcat.getConnector();
        tomcat.start();
    }

    public URI uri() {
        return this.uri;
    }

    public synchronized void stop() throws LifecycleException, IOException {
        if (!running) return;
        running = false;
        tomcat.stop();
        deleteBaseDir();
    }

    private void deleteBaseDir() throws IOException {
        // The Tomcat.setBaseDir() documentation explains the base dir schema:
        // - https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html#setBaseDir(java.lang.String)
        final var baseDir = new File("tomcat.%d".formatted(port));
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
