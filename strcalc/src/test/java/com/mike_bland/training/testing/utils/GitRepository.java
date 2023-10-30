/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;

public class GitRepository {
    public static File getRoot() throws IOException {
        try {
            var showToplevel = new ProcessBuilder(
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