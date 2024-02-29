/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

import com.mike_bland.training.testing.annotations.SmallTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ProdStringCalculatorTest {
    @SmallTest
    void emptyStringReturnsZero() {
        var calc = new ProdStringCalculator();

        int result = calc.add("");

        assertEquals(0, result);
    }

    @SmallTest
    void singleNumberReturnsSameNumber() {
        var calc = new ProdStringCalculator();

        int result = calc.add("1");

        assertEquals(1, result);
    }

    @SmallTest
    void returnsSumOfTwoNumbers() {
        var calc = new ProdStringCalculator();

        int result = calc.add("1,2");

        assertEquals(3, result);
    }
}
