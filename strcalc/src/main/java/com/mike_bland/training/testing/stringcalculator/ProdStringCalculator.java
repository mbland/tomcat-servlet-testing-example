/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

public class ProdStringCalculator {
    int add(String s) {
        if (s.isEmpty()) {
            return 0;
        }

        var parts = s.split(",");
        var result = Integer.parseInt(parts[0]);

        if (parts.length == 2) {
            result += Integer.parseInt(parts[1]);
        }
        return result;
    }
}
