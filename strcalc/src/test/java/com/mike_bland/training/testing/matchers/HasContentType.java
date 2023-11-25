package com.mike_bland.training.testing.matchers;

import org.hamcrest.Description;
import org.hamcrest.TypeSafeMatcher;

import java.net.http.HttpResponse;

// Custom Hamcrest matcher validating the Content-Type header of a HttpResponse.
//
// This could be generalized to check any HTTP header, or collection thereof.
// However, since this is a teaching example, we'll keep it straightforward.
class HasContentType<T> extends TypeSafeMatcher<HttpResponse<T>> {
    private final String expected;

    // Constructor to register the expected Content-Type value.
    HasContentType(String contentType) {
        this.expected = contentType;
    }

    // Helper method to extract the Content-Type value from an HttpResponse.
    private String getContentType(HttpResponse<T> resp) {
        return resp.headers().firstValue("Content-Type").orElse("");
    }

    // Performs the actual assertion.
    @Override public boolean matchesSafely(HttpResponse<T> resp) {
        return getContentType(resp).equals(expected);
    }

    // Describes the "Expected:" value in assertion failure messages.
    @Override public void describeTo(Description description) {
        description.appendText(expected);
    }

    // Describes the actual ("but:") value in assertion failure messages.
    @Override public void describeMismatchSafely(
            HttpResponse<T> resp, Description description) {
        description.appendText(getContentType(resp));
    }
}
