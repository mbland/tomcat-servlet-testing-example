package com.mike_bland.training.testing.utils;

import com.mike_bland.training.testing.utils.Docker;
import com.mike_bland.training.testing.utils.PortPicker;

import java.io.IOException;
import java.net.URI;

public class LocalServer {
    private String dockerfile;
    private int containerPort;
    private boolean running = false;
    private String imageId;
    private int port;
    private Process runCmd;

    public LocalServer(String dockerfile, int containerPort) {
        this.dockerfile = dockerfile;
        this.containerPort = containerPort;
    }

    public synchronized URI start() throws IOException, InterruptedException {
        Docker.assertIsAvailable();

        if (!running) {
            imageId = Docker.createTemporaryImage(dockerfile);
            port = PortPicker.pickUnusedPort();
            String portMap = String.format("%1$d:%2$d", port, containerPort);
            runCmd = Docker.runImage(imageId, portMap);
            Thread.sleep(1000);
            running = true;
        }
        return URI.create(String.format("http://localhost:%1$d", port));
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
