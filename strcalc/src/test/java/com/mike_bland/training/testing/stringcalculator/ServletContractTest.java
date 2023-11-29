/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mike_bland.training.testing.annotations.MediumCoverageTest;
import com.mike_bland.training.testing.annotations.MediumTest;
import com.mike_bland.training.testing.utils.PortPicker;
import com.mike_bland.training.testing.utils.TestTomcat;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;

import static com.mike_bland.training.testing.matchers.Matchers.hasContentType;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.samePropertyValuesAs;
import static org.junit.jupiter.api.Assertions.assertEquals;

// Test fixture containing a suite of medium-sized Servlet tests.
class ServletContractTest {
    // An embedded Tomcat instance controlled by this test fixture.
    private TestTomcat tomcat;

    // Runs before each test method in this class to create a TestTomcat
    // server for that test method.
    @BeforeEach
    void setUp() throws Exception {
       tomcat = new TestTomcat(
               PortPicker.pickUnusedPort(), Servlet.DEFAULT_ROOT
       );
    }

    // Runs after each test method in this class to stop the TestTomcat
    // server for that test method.
    @AfterEach
    void tearDown() throws Exception {
        tomcat.stop();
    }

    // Creates a new HttpRequests.Builder object configured for the local Tomcat
    // endpoint.
    HttpRequest.Builder newRequestBuilder(String relPath) {
        return HttpRequest.newBuilder().uri(tomcat.resolveEndpoint(relPath));
    }

    // Sends a HttpRequest that will follow redirects and handle the response
    // body as a String.
    HttpResponse<String> sendRequest(HttpRequest req)
            throws IOException, InterruptedException {
        var builder = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL);

        try (var client = builder.build()) {
            return client.send(req, BodyHandlers.ofString());
        }
    }

    static class Result {
        public HttpResponse<String> resp;
        public Servlet.CalculatorResponse payload;
    }

    // Sends an HttpRequest with a Servlet.CalculatorRequest JSON payload
    // initialized with `numbers`.
    Result sendStringCalculatorRequest(String numbers)
            throws IOException, InterruptedException {
        var mapper = new ObjectMapper();
        var payload = mapper.writeValueAsBytes(
                new Servlet.CalculatorRequest(numbers)
        );
        var req = newRequestBuilder("/add")
                .POST(HttpRequest.BodyPublishers.ofByteArray(payload))
                .build();
        var result = new Result();

        result.resp = sendRequest(req);
        result.payload = mapper.readValue(
                result.resp.body(), Servlet.CalculatorResponse.class
        );
        return result;
    }

    // Tests that the index.html page is in place, but covers no servlet code.
    // This is why it's a MediumTest, but not a MediumCoverageTest.
    //
    // This test ensures that our build process has generated the page into
    // the right directory, and that our TestTomcat is configured to find it.
    @MediumTest
    void servesLandingPage() throws Exception {
        var req = newRequestBuilder("/").GET().build();
        tomcat.start();

        var resp = sendRequest(req);

        assertEquals(HttpServletResponse.SC_OK, resp.statusCode());
        assertThat(resp, hasContentType("text/html"));
        assertThat(
                resp.body(),
                containsString("<title>String Calculator - ")
        );
    }

    // NOTE ON THE FOLLOWING TESTS
    // ---------------------------
    // The following tests exercise the Servlet handler methods, each being a
    // thin layer between the servlet container and the business logic.
    //
    // Though these are medium tests, they cover logic not covered by any small
    // test, so we collect coverage for (most of) them. These tests are
    // annotated with @MediumCoverageTest.
    //
    // The exception is productionImplementationTemporarilyReturnsError(), which
    // is a @MediumTest, for reasons explained in that test's comment.
    // ---------------------------------------------

    // Tests that GET /add returns a placeholder string. As noted in the
    // Servlet.doGet() comment, actual StringCalculator /add requests will use
    // the POST method. However, when just starting to write a Servlet, a GET
    // response like this can help with learning and troubleshooting.
    //
    // Since the Servlet scaffolding for the StringCalculator example is
    // actually in place, Servlet.doGet() and this test can be safely removed at
    // any time.
    @MediumCoverageTest
    void getAddEndpointReturnsPlaceholderString() throws Exception {
        var req = newRequestBuilder("/add").GET().build();
        // We're covering the zero argument Servlet constructor while injecting
        // a Servlet directly into the TestTomcat, which will leave the
        // Servlet's calculator member uninitialized. In this case it's OK,
        // since we aren't exercising a code path that uses it.
        tomcat.start(new Servlet());

        var resp = sendRequest(req);

        assertEquals(HttpServletResponse.SC_OK, resp.statusCode());
        assertThat(resp, hasContentType("text/plain;charset=UTF-8"));
        assertEquals("placeholder for /add API endpoint", resp.body());
    }

    // Tests that our TemporaryStringCalculator, configured via Weld/CDI
    // based on our settings in src/main/webapp, returns an error as expected.
    //
    // When the actual StringCalculator class is in place, this tests should
    // be updated or replaced to validate that the system uses that
    // implementation successfully. Until that time, this test serves to
    // ensure that Tomcat is finding and using the existing production
    // dependency.
    //
    // This test will run 30x-40x slower than the @MediumCoverageTests below.
    // This is because it uses the no-arg version of TestTomcat.start(), which:
    //
    // - reads configs from WEB_APP_SRC_DIR,
    // - loads classes from WEB_INF_CLASSES,
    // - registers artifacts from WEB_APP_BUILD_DIR, and
    // - starts Weld to inject dependencies.
    //
    // This @MediumTest vs. @MediumCoverageTests:
    // -----------------------------------------
    // For the same reasons that make this test slower, it also serves as a
    // larger, more comprehensive @MediumTest. It ensures, in a relatively
    // focused, isolated, and quick manner, that the app's build and runtime
    // configuration behaves as expected. It provides confidence in our Tomcat
    // configuration without requiring that we serve the frontend and interact
    // with a browser, like our @LargeTests. This makes the @MediumTest
    // faster and more focused than any @LargeTest, which helps us identify
    // problems and iterate on fixing them more quickly. In other words, this
    // @MediumTest provides a tighter feedback loop for Tomcat and Servlet
    // integration issues than the @LargeTests.
    //
    // So if the @MediumTest breaks, but not our @LargeTests or @SmallTests, we
    // can rule out frontend problems or business logic bugs. We can focus
    // purely on repairing our Tomcat configuration. (Chances are, the
    // @LargeTests would also fail, but our @MediumTests would point at the
    // problem being with our Tomcat integration, not the frontend.)
    //
    // Since this @MediumTest does execute a swath of actual business logic,
    // however, we don't collect code coverage from it. We _could_, but it's
    // best to only collect coverage from tests narrowly focused on specific
    // bits of logic, as explained below.
    //
    // The @MediumCoverageTests in this class that use the start(Servlet)
    // variant run much faster, because that variant registers a fully
    // constructed Servlet directly from memory. Those tests are good for
    // exercising all the different paths through the Servlet logic quickly and
    // thoroughly, without depending on production implementations,
    // configurations, and dependencies. Since they're focused on and exercise
    // only the Servlet logic, making them smaller than other @MediumTests,
    // they're tagged to collect coverage.
    //
    // They are, of course, technically still "medium," because they focus on
    // integration points between different components instead of isolated units
    // of business logic. Specifically, they exercise how the StringCalculator
    // business unit plugs into a Servlet implementation served by a Tomcat
    // instance.
    //
    // So we get the best of both worlds with a mix of @MediumTests and
    // @MediumCoverageTests. The @MediumTests run slower, but provide
    // confidence in the overall integration without getting bogged down in
    // exercising all the Servlet logic. The @MediumCoverageTests sidestep
    // the production configuration and dependencies, but exercise all the
    // Servlet logic thoroughly and quickly.
    //
    // NOTE ON CODE COVERAGE FROM SMALLER VS. LARGER TESTS:
    // ---------------------------------------------------
    // The larger the size of tests used to generate code coverage, the less
    // useful that coverage becomes. The Test Pyramid strategy encourages
    // building up high code coverage from a large suite of smaller tests, not a
    // small suite of larger tests.
    //
    // When a larger test fails, without code coverage from smaller tests, it
    // takes more work to identify which code throughout the system produced the
    // failure. In many cases, people are tempted to ignore such failures,
    // because of the time and work required to understand and repair them. In
    // this case, we've wasted resources collecting "high" code coverage that no
    // one trusts, or that otherwise provides any value.
    //
    // When a smaller test fails, there's a much smaller amount of code
    // potentially responsible. This increases the chances of the problem being
    // understood and repaired in a timely fashion. This, in turn, maintains
    // trust and confidence in the code coverage derived from such a test suite.
    //
    // In the presence of tests of all sizes, we can achieve maximum
    // insight, trust, utility, efficiency, and overall value from code
    // coverage. Each combination of passing and failing tests from different
    // levels provides specific insight into the source of a problem:
    //
    // - If a smaller test fails, but larger tests pass, we can focus on lower
    //   level logic without worrying about higher level problems.
    // - If smaller and larger tests fail, we can start by focusing on the
    //   lower level logic. Fixing that logic may fix the larger tests as well.
    // - If a larger test fails, but the smaller tests pass, we can focus on
    //   higher level issues and system integration without worrying about
    //   business logic.
    @MediumTest
    void productionImplementationTemporarilyReturnsError() throws Exception {
        tomcat.start();

        var r = sendStringCalculatorRequest("");

        assertEquals(HttpServletResponse.SC_BAD_REQUEST, r.resp.statusCode());
        assertThat(r.resp, hasContentType("application/json;charset=UTF-8"));
        var expected = new Servlet.CalculatorResponse(
                0, "TemporaryStringCalculator received: \"\""
        );
        assertThat(r.payload, samePropertyValuesAs(expected));
    }

    // Tests the success path through Servlet.doPost().
    //
    // This test, and the other @MediumCoverageTest, show how we can inject a
    // test double into a Servlet, and inject that Servlet into Tomcat.
    //
    // Our StringCalculator interface contains a single abstract method,
    // qualifying it as what Java calls a "functional interface". As a result,
    // can define our test doubles inline as Lambda expressions:
    //
    // - https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/function/package-summary.html
    // - https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html#approach5
    //
    // NOTE ON CONTRACT TESTS AND THE USE OF TEST DOUBLES:
    // --------------------------------------------------
    // Our StringCalculator implementation won't be very complex by actual
    // production application standards. In our production code, we may
    // choose not to use test doubles at all, if the actual dependency is
    // fast, reliable, and easy to use. It's actually desirable to use such
    // dependencies directly, as there's nothing gained by replacing them with
    // test doubles.
    //
    // However, just as often, our applications contain a _lot_ of business
    // logic, which isn't always fast or reliable, or becomes less so in
    // aggregate. Dependency fan-out can potentially make builds and tests
    // painfully slow. It can also be complex, unreliable, and cost
    // prohibitive to simulate errors using production dependencies, if it's
    // even possible.
    //
    // In that case, strategic use of test doubles can help us write faster,
    // more thorough, more reliable tests. This enables us to work out any
    // problems with the code we're focusing on quickly without the expense,
    // complexity, and potential unreliability of production dependencies.
    //
    // We still need larger tests to provide confidence in the overall system
    // and its production dependencies. However, we can have more confidence
    // in those tests, while requiring fewer of them, if we've written enough
    // well-designed smaller tests to complement them.
    //
    // The @MediumTest also serves as a "contract" or "collaboration" test that
    // helps ensure that our test doubles continue to uphold production
    // constraints. We can remain confident in our test doubles as long as the
    // @MediumTest passes, since they implement the same StringCalculator
    // interface as the production implementation. If the @MediumTest fails
    // in a way that invalidates the StringCalculator interface contract,
    // we'll know we need to update our test doubles accordingly.
    //
    // The following test double based @MediumCoverageTests alone won't provide
    // total confidence in our Tomcat and Servlet integration. Paired with the
    // @MediumTest above, however, they can give us confidence that all issues
    // and corners of the code are well covered.
    @MediumCoverageTest
    void addRequestSuccess() throws Exception {
        tomcat.start(new Servlet(numbers -> Integer.MAX_VALUE));

        var r = sendStringCalculatorRequest("");

        assertEquals(HttpServletResponse.SC_OK, r.resp.statusCode());
        assertThat(r.resp, hasContentType("application/json;charset=UTF-8"));
        var expected = new Servlet.CalculatorResponse(Integer.MAX_VALUE, null);
        assertThat(r.payload, samePropertyValuesAs(expected));
    }

    // Tests the error path through Servlet.doPost().
    //
    // NOTE ON KEEPING SEEMINGLY REDUNDANT TEST METHODS:
    // ------------------------------------------------
    // You may notice that the productionImplementationTemporarilyReturnsError
    // test method covers the same error path. So if we already have that
    // test, why have this one?
    //
    // Solely from the perspective of the teaching example, this case helps
    // illustrate how one can easily simulate an error with a test double.
    // It's often the case that simulating errors using production dependencies
    // can be complex, unreliable, and cost prohibitive, if even possible.
    // Easily, cheaply, and reliably simulating error conditions is one of
    // the biggest benefits of using test doubles.
    //
    // From the perspective of the current configuration, this test is a
    // @MediumCoverageTest, and the earlier test is a @MediumTest. If we
    // remove this test, we either lose code coverage, or we'll have to make
    // the @MediumTest into a @MediumCoverageTest. This is a relatively minor
    // concern, but still worth noting explicitly.
    //
    // Beyond that, building on the earlier conversation regarding
    // @MediumTests and @MediumCoverageTests, there will necessarily be some
    // degree of overlap between the two. However, keeping the smaller test
    // helps us iterate quickly when working on the same code path. The
    // smaller test, even in its current form, is orders of magnitude faster
    // than the @MediumTest.
    //
    // As one moves up the Test Pyramid, there will be larger tests that
    // necessarily execute the same code paths as smaller tests. One may not
    // want to unnecessarily duplicate test coverage on principle, but trying to
    // eliminate all duplication between tests can prove even more inefficient.
    //
    // In fact, it could prove harmful. Note the commment for
    // productionImplementationTemporarilyReturnsError() recommends updating or
    // replacing it with the actual StringCalculator implementation when ready.
    // At that point, this test may no longer be redundant. If the student
    // chooses to validate a successful StringCalculator operation, the previous
    // test case will become redundant! If we remove this "redundant" test
    // now, we might end up with a testing gap later without realizing it.
    //
    // Given that the smaller test should be relatively easy to maintain,
    // there's no harm and some appreciable benefit to keeping this
    // "overlapping" test case around.
    @MediumCoverageTest
    void addRequestError() throws Exception {
        tomcat.start(new Servlet(numbers -> {
            throw new StringCalculator.Exception(
                    String.format("received: %s", numbers)
            );
        }));

        var r = sendStringCalculatorRequest("foobar");

        assertEquals(HttpServletResponse.SC_BAD_REQUEST, r.resp.statusCode());
        assertThat(r.resp, hasContentType("application/json;charset=UTF-8"));
        var expected = new Servlet.CalculatorResponse(
                0, "received: foobar"
        );
        assertThat(r.payload, samePropertyValuesAs(expected));
    }
}
