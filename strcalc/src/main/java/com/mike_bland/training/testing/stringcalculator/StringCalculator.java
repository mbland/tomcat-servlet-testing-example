package com.mike_bland.training.testing.stringcalculator;

public interface StringCalculator {
    class Exception extends java.lang.Exception {
        public Exception(String message) {
            super(message);
        }
    }

    int add(String numbers) throws Exception;
}
