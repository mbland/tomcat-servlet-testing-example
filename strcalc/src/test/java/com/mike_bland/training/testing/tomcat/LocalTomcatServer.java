package com.mike_bland.training.testing.tomcat;

import com.mike_bland.training.testing.utils.PortPicker;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.net.URI;

public class LocalTomcatServer {
    public final String DOCKERFILE = "dockerfiles/Dockerfile.tomcat-test";
    private boolean running = false;
    private String imageId;
    private int port;
    private Process runCmd;

    public synchronized URI start() throws IOException, InterruptedException {
        assertDockerIsAvailable();

        if (!running) {
            imageId = createTemporaryImage();
            port = PortPicker.pickUnusedPort();
            runCmd = runTemporaryImage(imageId, port);
            Thread.sleep(1000);
            running = true;
        }
        return URI.create("http://localhost:" + port + "/strcalc");
    }

    public synchronized void stop() throws IOException, InterruptedException{
        if (running) {
            runCmd.destroy();
            Thread.sleep(1000);
            destroyTemporaryImage(imageId);
            running = false;
        }
    }

    Process startProcess(ProcessBuilder builder, String errPrefix)
            throws IOException {
        try {
            return builder.start();
        } catch (IOException ex) {
            throw new IOException(errPrefix + ": " + ex.toString());
        }
    }

    File repositoryRoot() throws IOException {
        final String errPrefix = "failed to get git repository root: ";
        Process showToplevel = startProcess(
                new ProcessBuilder(
                        "git", "rev-parse", "--show-toplevel"),
                errPrefix);

        try (BufferedReader stdout = showToplevel.inputReader()) {
            return new File(stdout.readLine());
        } catch (IOException ex) {
            throw new IOException(errPrefix + ex.toString());
        }
    }

    void assertDockerIsAvailable() throws IOException {
        final String errPrefix = "Docker not available: ";
        Process dockerInfo = startProcess(
                new ProcessBuilder("docker", "info"),
                errPrefix);

        try (BufferedReader stderr = dockerInfo.errorReader()) {
            if (dockerInfo.waitFor() != 0) {
                throw new IOException(errPrefix + stderr.readLine());
            }
        } catch (IOException | InterruptedException e) {
            throw new IOException(errPrefix + e.toString());
        }
    }

    String createTemporaryImage() throws IOException {
        final String errPrefix = "failed to create temporary Docker image: ";
        ProcessBuilder builder = new ProcessBuilder(
                "docker", "build", "-q", "-f", DOCKERFILE, ".")
                .directory(repositoryRoot());
        Process dockerBuild = startProcess(builder, errPrefix);

        try (BufferedReader stdout = dockerBuild.inputReader();
             BufferedReader stderr = dockerBuild.errorReader()) {
            if (dockerBuild.waitFor() == 0) {
                return stdout.readLine();
            }
            throw new IOException(errPrefix + stderr.readLine());

        } catch (IOException | InterruptedException e) {
            throw new IOException(errPrefix + e.toString());
        }
    }

    Process runTemporaryImage(String imageId, int port) throws IOException {
        final String errPrefix = "error running Docker image: ";
        final String portMap = port + ":8080";
        ProcessBuilder builder = new ProcessBuilder(
                "docker", "run", "--rm", "-p", portMap, imageId);
        return startProcess(builder, errPrefix);
    }

    void destroyTemporaryImage(String imageId) throws IOException {
        final String errPrefix = "failed to destroy temporary Docker image: ";
        Process dockerRmi = startProcess(
                new ProcessBuilder("docker", "rmi", imageId),
                errPrefix);

        try (BufferedReader stderr = dockerRmi.errorReader()) {
            if (dockerRmi.waitFor() != 0) {
                throw new IOException(errPrefix + stderr.readLine());
            }
        } catch (IOException | InterruptedException e) {
            throw new IOException(errPrefix + e.toString());
        }
    }
}
