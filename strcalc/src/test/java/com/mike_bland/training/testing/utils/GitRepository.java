package com.mike_bland.training.testing.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;

public class GitRepository {
    public static File getRoot() throws IOException {
        try {
            Process showToplevel = new ProcessBuilder(
                    "git", "rev-parse", "--show-toplevel")
                    .start();

            try (BufferedReader stdout = showToplevel.inputReader()) {
                return new File(stdout.readLine());
            }
        } catch (IOException ex) {
            throw new IOException(
                    "failed to get git repository root: " + ex.toString()
            );
        }
    }
}