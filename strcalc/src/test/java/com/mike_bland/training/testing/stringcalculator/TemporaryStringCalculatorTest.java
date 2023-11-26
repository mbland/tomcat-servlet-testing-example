/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

import com.mike_bland.training.testing.annotations.SmallTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class TemporaryStringCalculatorTest {
    @SmallTest
    void alwaysThrows() {
        var calc = new TemporaryStringCalculator();

        var e = assertThrows(
                TemporaryStringCalculator.Exception.class, () -> calc.add("2,2")
        );

        var expected = "TemporaryStringCalculator received: \"2,2\"";
        assertEquals(expected, e.getMessage());
    }
}
