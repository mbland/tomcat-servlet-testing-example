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
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.time.Duration;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
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
        driver = getChromeDriver();
    }

    // Return a fully configured ChromeDriver instance.
    //
    // If /usr/bin/chromium if present, it will use this browser and set the
    // ChromeDriver instance to /usr/bin/chromedriver. This is because Google
    // Chrome isn't yet available for arm64 Linux, and WebDriver doesn't
    // download the correct driver, either:
    //
    // - https://developer.chrome.com/blog/chrome-for-testing
    // - https://googlechromelabs.github.io/chrome-for-testing/
    // - https://github.com/GoogleChromeLabs/chrome-for-testing#json-api-endpoints
    // - https://github.com/SeleniumHQ/selenium/issues/11357#issuecomment-1664270630
    //
    // It also won't work with a snap-installed version of Chromium. At the time
    // of writing, I installed Chromium by upgrading to Ubuntu 23.10
    // and following the following advice to install Chromium from Debian:
    //
    // - https://askubuntu.com/questions/1179273/how-to-remove-snap-completely-without-losing-the-chromium-browser/1206502#1206502
    //
    // For future reference, this is how to install the non-snap version of
    // Firefox from Mozilla:
    //
    // - https://www.omgubuntu.co.uk/2022/04/how-to-install-firefox-deb-apt-ubuntu-22-04
    //
    // Also of note: Upgrading to Ubuntu 23.10 will not automatically upgrade
    // any Docker packages installed via:
    //
    // - https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
    //
    // The effect is that the Docker container will run, but nothing can
    // connect to its ports. This will cause the WebDriver tests to hang
    // (until we move away from using Docker and running Tomcat directly).
    //
    // To fix it:
    //
    // ```sh
    // sudo apt remove docker-ce docker-ce-cli containerd.io \
    //   docker-buildx-plugin docker-compose-plugin
    //
    // # Get the value of VERSION_CODENAME from /etc/os-release or
    // # `lsb_release -cs`. Update the codename in the following file with
    // # this value. Going from Ubuntu 22.04 to 23.10, this will replace
    // # "jammy" with "mantic".
    // sudo vim /etc/apt/sources.list.d/docker.list
    //
    // sudo apt install docker-ce docker-ce-cli containerd.io \
    //   docker-buildx-plugin docker-compose-plugin
    // ```
    public ChromeDriver getChromeDriver() {
        // - https://www.selenium.dev/documentation/webdriver/browsers/chrome/
        // - https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md
        // - https://peter.sh/experiments/chromium-command-line-switches/
        var options = new ChromeOptions();
        options.addArguments("--headless");
        options.setImplicitWaitTimeout(Duration.ofMillis(500));

        var chromiumBrowser = new File("/usr/bin/chromium");
        if (!chromiumBrowser.exists()) {
            return new ChromeDriver(options);
        }

        // - https://www.selenium.dev/documentation/webdriver/drivers/service/#driver-location
        // - https://github.com/SeleniumHQ/seleniumhq.github.io/blob/trunk/examples/java/src/test/java/dev/selenium/drivers/ServiceTest.java#L25-L26
        var service = new ChromeDriverService.Builder()
                .usingDriverExecutable(new File("/usr/bin/chromedriver"))
                .build();
        options.setBinary(chromiumBrowser);
        return new ChromeDriver(service, options);
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

    // This title test exists solely to allow the Gradle "test-large" task to
    // pass until actual @LargeTests are present:
    //
    // - https://docs.gradle.org/8.4/userguide/upgrading_version_8.html#test_task_fail_on_no_test_executed
    //
    //  Please replace or delete it when you're ready to add actual tests.
    @LargeTest
    void testTitle() {
        driver.get(endpoint("/"));

        WebElement elem = driver.findElement(By.cssSelector("h1.title a"));

        assertEquals("Hello, World!", elem.getText());
        assertThat(
                elem.getAttribute("href"),
                containsString("%22Hello,_World!%22")
        );
    }
}
