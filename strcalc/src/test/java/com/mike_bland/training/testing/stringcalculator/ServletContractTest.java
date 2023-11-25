/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

import com.mike_bland.training.testing.annotations.MediumCoverageTest;
import com.mike_bland.training.testing.annotations.MediumTest;
import com.mike_bland.training.testing.utils.PortPicker;
import com.mike_bland.training.testing.utils.TestTomcat;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.Optional;

import static com.mike_bland.training.testing.matchers.Matchers.hasContentType;
import static com.mike_bland.training.testing.stringcalculator.Servlet.DEFAULT_ROOT;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;

// Tomcat must be running and the latest build deployed before running this
// test. Run the Local Tomcat run configuration first.
class ServletContractTest {
    private static TestTomcat tomcat;

    @BeforeAll
    static void setUpClass() throws Exception {
       tomcat = new TestTomcat(
               PortPicker.pickUnusedPort(), Servlet.DEFAULT_ROOT
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

    // This tests that the index.html page is in place, but covers no servlet
    // code. This is why it's a MediumTest, but not a MediumCoverageTest.
    @MediumTest
    void servesCorrectLandingPage() throws Exception {
        var req = newRequestBuilder("/").GET().build();

        var resp = sendRequest(req);

        assertEquals(HttpServletResponse.SC_OK, resp.statusCode());
        assertThat(resp, hasContentType("text/html"));
        assertThat(
                resp.body(),
                containsString("<title>String Calculator - ")
        );
    }

    // This tests the Servlet handler, which is a thin layer between the
    // servlet container and the business logic. Though it's a medium test,
    // it covers logic not covered by any small test, so we collect coverage
    // for it.
    @MediumCoverageTest
    void addEndpointPlaceholder() throws Exception {
        var req = newRequestBuilder("/add").GET().build();

        var resp = sendRequest(req);

        assertEquals(HttpServletResponse.SC_OK, resp.statusCode());
        assertThat(resp, hasContentType("text/plain;charset=UTF-8"));
        assertEquals("placeholder for /add API endpoint", resp.body());
    }
}
