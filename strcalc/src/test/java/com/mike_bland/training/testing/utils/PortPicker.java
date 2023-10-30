package com.mike_bland.training.testing.utils;

import java.io.IOException;
import java.net.ServerSocket;

public class PortPicker {
    public static int pickUnusedPort() throws IOException {
        try (ServerSocket sock = new ServerSocket(0)) {
            return sock.getLocalPort();
        }
    }
}