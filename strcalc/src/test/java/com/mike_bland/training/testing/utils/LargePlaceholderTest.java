/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.utils;

import com.mike_bland.training.testing.sizes.LargeTest;

// This test suite exists solely to allow the "test-large" task to pass until
// actual @LargeTests are present. Please remove it once they are.
//
// - https://docs.gradle.org/8.4/userguide/upgrading_version_8.html#test_task_fail_on_no_test_executed
public class LargePlaceholderTest {
    @LargeTest
    void testPlaceholder() {
    }
}
