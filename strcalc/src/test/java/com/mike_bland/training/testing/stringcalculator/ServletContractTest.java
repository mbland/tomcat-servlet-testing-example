/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

import com.mike_bland.training.testing.annotations.MediumTest;
import com.mike_bland.training.testing.utils.PortPicker;
import com.mike_bland.training.testing.utils.TestTomcat;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.Optional;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;

// Tomcat must be running and the latest build deployed before running this
// test. Run the Local Tomcat run configuration first.
class ServletContractTest {
    private static final String SERVLET_ROOT = "/strcalc";
    private static TestTomcat tomcat;

    @BeforeAll
    static void setUpClass() throws Exception {
       tomcat = new TestTomcat(
               PortPicker.pickUnusedPort(), SERVLET_ROOT
       );
       tomcat.start();
    }

    @AfterAll
    static void tearDownClass() throws Exception {
        tomcat.stop();
    }

    HttpRequest.Builder newRequestBuilder(String relPath) {
        return HttpRequest.newBuilder().uri(tomcat.resolveEndpoint(relPath));
    }

    HttpResponse<String> sendRequest(HttpRequest req)
            throws IOException, InterruptedException {
        var builder = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL);

        try (var client = builder.build()) {
            return client.send(req, BodyHandlers.ofString());
        }
    }

    @MediumTest
    void landingPageHelloWorld() throws Exception {
        var req = newRequestBuilder("/").GET().build();

        var resp = sendRequest(req);

        assertEquals(200, resp.statusCode());
        assertEquals(
                Optional.of("text/html"),
                resp.headers().firstValue("Content-Type")
        );
        assertThat(resp.body(), containsString("Hello, World!"));
    }

    @MediumTest
    void addEndpointPlaceholder() throws Exception {
        var req = newRequestBuilder("/add").GET().build();

        var resp = sendRequest(req);

        assertEquals(200, resp.statusCode());
        assertEquals(
                Optional.of("text/plain;charset=UTF-8"),
                resp.headers().firstValue("Content-Type")
        );
        assertEquals("placeholder for /add API endpoint", resp.body());
    }
}
