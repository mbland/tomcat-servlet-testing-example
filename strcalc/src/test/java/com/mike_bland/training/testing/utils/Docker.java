/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.utils;

import java.io.IOException;

public class Docker {
    public static void assertIsAvailable() throws IOException {
        try {
            var dockerInfo = new ProcessBuilder("docker", "info")
                    .start();

            try (var stderr = dockerInfo.errorReader()) {
                if (dockerInfo.waitFor() != 0) {
                    throw new IOException(stderr.readLine());
                }
            }
        } catch (IOException | InterruptedException e) {
            throw new IOException("Docker not available: " + e);
        }
    }

    public static String createTemporaryImage(String dockerfile)
            throws IOException {
        try {
            var dockerBuild = new ProcessBuilder(
                    "docker", "build", "-q", "-f", dockerfile, ".")
                    .directory(GitRepository.getRoot())
                    .start();

            try (var stdout = dockerBuild.inputReader();
                 var stderr = dockerBuild.errorReader()) {
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

    public static Process runImage(String imageId, String portMap)
            throws IOException {
        try {
            return new ProcessBuilder(
                    "docker", "run", "--rm", "-p", portMap, imageId)
                    .start();

        } catch (IOException e) {
            throw new IOException("error running Docker image: " + e);
        }
    }

    public static void destroyImage(String imageId) throws IOException {
        try {
            var dockerRmi = new ProcessBuilder(
                    "docker", "rmi", imageId)
                    .start();

            try (var stderr = dockerRmi.errorReader()) {
                if (dockerRmi.waitFor() != 0) {
                    throw new IOException(stderr.readLine());
                }
            }
        } catch (IOException | InterruptedException e) {
            throw new IOException("failed to destroy Docker image: " + e);
        }
    }
}
