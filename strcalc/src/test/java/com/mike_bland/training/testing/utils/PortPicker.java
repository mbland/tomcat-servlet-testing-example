/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

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
