package com.mike_bland.training.testing.tomcat;

import com.mike_bland.training.testing.utils.GitRepository;
import com.mike_bland.training.testing.utils.PortPicker;

import java.io.BufferedReader;
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
            imageId = createTemporaryImage(DOCKERFILE);
            port = PortPicker.pickUnusedPort();
            runCmd = runTemporaryImage(imageId, port + ":8080");
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

    void assertDockerIsAvailable() throws IOException {
        try {
            Process dockerInfo = new ProcessBuilder("docker", "info")
                    .start();

            try (BufferedReader stderr = dockerInfo.errorReader()) {
                if (dockerInfo.waitFor() != 0) {
                    throw new IOException(stderr.readLine());
                }
            }
        } catch (IOException | InterruptedException e) {
            throw new IOException("Docker not available: " + e);
        }
    }

    String createTemporaryImage(String dockerfile) throws IOException {
        try {
            Process dockerBuild = new ProcessBuilder(
                    "docker", "build", "-q", "-f", dockerfile, ".")
                    .directory(GitRepository.getRoot())
                    .start();

            try (BufferedReader stdout = dockerBuild.inputReader();
                 BufferedReader stderr = dockerBuild.errorReader()) {
                if (dockerBuild.waitFor() == 0) {
                    return stdout.readLine();
                }
                throw new IOException(stderr.readLine());
            }
        } catch (IOException | InterruptedException e) {
            throw new IOException(
                    "failed to create temporary Docker image: " + e
            );
        }
    }

    Process runTemporaryImage(String imageId, String portMap)
            throws IOException {
        try {
            return new ProcessBuilder(
                    "docker", "run", "--rm", "-p", portMap, imageId)
                    .start();

        } catch (IOException e) {
            throw new IOException("error running Docker image: " + e);
        }
    }

    void destroyTemporaryImage(String imageId) throws IOException {
        try {
            Process dockerRmi = new ProcessBuilder(
                    "docker", "rmi", imageId)
                    .start();

            try (BufferedReader stderr = dockerRmi.errorReader()) {
                if (dockerRmi.waitFor() != 0) {
                    throw new IOException(stderr.readLine());
                }
            }
        } catch (IOException | InterruptedException e) {
            throw new IOException(
                    "failed to destroy temporary Docker image: " + e
            );
        }
    }
}
