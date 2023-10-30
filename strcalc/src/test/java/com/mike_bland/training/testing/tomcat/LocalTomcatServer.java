package com.mike_bland.training.testing.tomcat;

import com.mike_bland.training.testing.utils.Docker;
import com.mike_bland.training.testing.utils.PortPicker;

import java.io.IOException;
import java.net.URI;

public class LocalTomcatServer {
    public final String DOCKERFILE = "dockerfiles/Dockerfile.tomcat-test";
    private boolean running = false;
    private String imageId;
    private int port;
    private Process runCmd;

    public synchronized URI start() throws IOException, InterruptedException {
        Docker.assertIsAvailable();

        if (!running) {
            imageId = Docker.createTemporaryImage(DOCKERFILE);
            port = PortPicker.pickUnusedPort();
            runCmd = Docker.runImage(imageId, port + ":8080");
            Thread.sleep(1000);
            running = true;
        }
        return URI.create("http://localhost:" + port + "/strcalc");
    }

    public synchronized void stop() throws IOException, InterruptedException{
        if (running) {
            runCmd.destroy();
            Thread.sleep(1000);
            Docker.destroyImage(imageId);
            running = false;
        }
    }
}
