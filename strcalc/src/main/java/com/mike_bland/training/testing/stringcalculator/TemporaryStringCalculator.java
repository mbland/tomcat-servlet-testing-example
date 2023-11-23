package com.mike_bland.training.testing.stringcalculator;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TemporaryStringCalculator implements StringCalculator {
    public static class Exception extends StringCalculator.Exception {
        public Exception(String numbers) {
            super(String.format(
                    "TemporaryStringCalculator received: \"%s\"", numbers
            ));
        }
    }

    @Override
    public int add(String numbers) throws Exception {
        throw new Exception(numbers);
    }
}
