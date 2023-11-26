/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

import com.mike_bland.training.testing.annotations.LargeTest;
import com.mike_bland.training.testing.utils.LocalServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class WebApplicationTest {
    private static LocalServer app;
    private static URI appUri;
    private WebDriver driver;

    @BeforeAll
    static void setUpClass() throws IOException, InterruptedException {
        app = new LocalServer(
                "dockerfiles/Dockerfile.tomcat-test", 8080
        );
        appUri = app.start(2500);
    }

    @BeforeEach
    void setUp() {
        // - https://www.selenium.dev/documentation/webdriver/browsers/chrome/
        // - https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md
        // - https://peter.sh/experiments/chromium-command-line-switches/
        var options = new ChromeOptions();
        options.addArguments("--headless");
        options.setImplicitWaitTimeout(Duration.ofMillis(500));
        driver = new ChromeDriver(options);
    }

    @AfterEach
    void tearDown() {
        driver.quit();
    }

    @AfterAll
    static void tearDownClass() throws IOException, InterruptedException {
        app.stop(2500);
    }

    String endpoint(String relPath) {
        if (!relPath.startsWith("/")) {
            final var msg = "endpoint path should begin with '/', got: \"%s\"";
            throw new IllegalArgumentException(msg.formatted(relPath));
        }
        return appUri
                .resolve("%s%s".formatted(Servlet.DEFAULT_ROOT, relPath))
                .toString();
    }

    // This placeholder test exists solely to allow the Gradle "test-large"
    // task to pass until actual @LargeTests are present:
    //
    // - https://docs.gradle.org/8.4/userguide/upgrading_version_8.html#test_task_fail_on_no_test_executed
    //
    //  Please replace or delete it when you're ready to add actual tests.
    @LargeTest
    void testPlaceholder() {
        driver.get(endpoint("/"));

        WebElement body = driver.findElement(By.cssSelector("p.placeholder"));

        assertEquals("Hello, World!", body.getText());
    }
}
