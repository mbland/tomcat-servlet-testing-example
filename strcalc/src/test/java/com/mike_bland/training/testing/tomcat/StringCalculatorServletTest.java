/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.tomcat;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.net.URI;

import com.mike_bland.training.testing.sizes.MediumTest;
import com.mike_bland.training.testing.utils.LocalServer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.AfterAll;
import static org.junit.jupiter.api.Assertions.assertEquals;

// Tomcat must be running and the latest build deployed before running this
// test. Run the Local Tomcat run configuration first.
class StringCalculatorServletTest {
    private static LocalServer tomcatServer = new LocalServer(
            "dockerfiles/Dockerfile.tomcat-test", 8080
    );
    private static URI tomcatUri;

    @BeforeAll
    static void setUpClass() throws Exception {
       tomcatUri = tomcatServer.start(1000).resolve("/strcalc");
    }

    @AfterAll
    static void tearDownClass() throws Exception {
        tomcatServer.stop(250);
    }

    @MediumTest
    void helloWorldPlaceholder() throws Exception {
        var builder = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL);
        var req = HttpRequest.newBuilder().uri(tomcatUri).GET().build();
        HttpResponse<String> resp;

        try (var client = builder.build()) {
            resp = client.send(req, BodyHandlers.ofString());
        }

        assertEquals(200, resp.statusCode());
        assertEquals("Hello, World!", resp.body());
    }
}
