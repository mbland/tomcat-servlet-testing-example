package com.mike_bland.training.testing.matchers;

import org.hamcrest.Matcher;

import java.net.http.HttpResponse;

// Collection of custom Hamcrest Matcher<T> classes for assertThat() statements.
//
// These tutorials describe how to write Matchers:
//
// - https://hamcrest.org/JavaHamcrest/tutorial
// - https://www.baeldung.com/hamcrest-custom-matchers
//
// Note that these tutorials show the static factory functions defined on the
// same class as the Matcher. However, Hamcrest itself collects these factories
// into its own org.hamcrest.Matchers class for convenience, instead of
// importing one class per Matcher.
public class Matchers {
    public static <T> Matcher<HttpResponse<T>> hasContentType(
            String contentType) {
        return new HasContentType<>(contentType);
    }
}
