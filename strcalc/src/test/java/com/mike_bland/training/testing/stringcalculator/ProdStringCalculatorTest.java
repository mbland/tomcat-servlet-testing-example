/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

import com.mike_bland.training.testing.annotations.SmallTest;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ProdStringCalculatorTest {
    ProdStringCalculator calc;

    @BeforeEach
    void setUp() {
        calc = new ProdStringCalculator();
    }

    @SmallTest
    void emptyStringReturnsZero() {
        assertEquals(0, calc.add(""));
    }

    @SmallTest
    void singleNumberReturnsSameNumber() {
        assertEquals(1, calc.add("1"));
    }

    @SmallTest
    void returnsSumOfTwoNumbers() {
        assertEquals(3, calc.add("1,2"));
    }
}
