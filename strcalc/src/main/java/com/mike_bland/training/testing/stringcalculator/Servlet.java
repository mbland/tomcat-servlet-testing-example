/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package com.mike_bland.training.testing.stringcalculator;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.io.IOException;

@WebServlet("/add")
public class Servlet extends HttpServlet {
    public static final String DEFAULT_ROOT = "/strcalc";

    private final ObjectMapper mapper = new ObjectMapper();
    @Inject private StringCalculator calculator;

    // No-arg constructor required for Tomcat startup.
    //
    // After creation, Weld injects the calculator field before Tomcat invokes
    // Servlet.init(). See the comment for printMethodAndCalculatorClass()
    // below.
    public Servlet() {
        printMethodAndCalculatorClass(this.calculator);
    }

    // Allows us to inject different implementations for testing.
    //
    // The @Inject annotation does nothing with this constructor, because Tomcat
    // will create the Servlet using the no-arg constructor before Weld
    // injection begins. See the comment for printMethodAndCalculatorClass()
    // below.
    Servlet(StringCalculator calculator) {
        this.calculator = calculator;
        printMethodAndCalculatorClass(this.calculator);
    }

    // Initializes the Servlet after Weld injects dependencies.
    //
    // See the comment for printMethodAndCalculatorClass() below.
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        printMethodAndCalculatorClass(this.calculator);
    }

    // Defines the StringCalculator request payload.
    @AllArgsConstructor
    @NoArgsConstructor
    static class CalculatorRequest {
        public String numbers;
    }

    // Defines the StringCalculator response payload.
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonInclude(Include.NON_DEFAULT)
    static class CalculatorResponse {
        public int result;
        public String error;
    }

    // Returns a placeholder string.
    //
    // Actual StringCalculator /add requests will use the POST method, but this
    // GET response can help with learning and troubleshooting. It can be safely
    // removed at any time.
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.setContentType("text/plain");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().print("placeholder for /add API endpoint");
    }

    // Satisfies a StringCalculator.add() request.
    //
    // The request body should contain a JSON CalculatorRequest payload.
    //
    // If StringCalculator.add() throws, the "error" field of the JSON
    // CalculatorResponse payload will contain the exception message.
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
        var respPayload = new CalculatorResponse();

        try (var reqBody = req.getInputStream()) {
            var reqPayload = mapper.readValue(reqBody, CalculatorRequest.class);
            respPayload.result = calculator.add(reqPayload.numbers);
            resp.setStatus(HttpServletResponse.SC_OK);

        } catch (StringCalculator.Exception e) {
            respPayload.error = e.getMessage();
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
        try (var respBody = resp.getOutputStream()) {
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            respBody.write(mapper.writeValueAsBytes(respPayload));
        }
    }

    // Used to illustrate how Servlet construction, initialization, and
    // dependency injection happens.
    //
    // When Tomcat launches a servlet (i.e., by loading a WAR file or using
    // methods other than Tomcat.addServlet()), we see that only the no-arg
    // constructor executes. By the time init() executes, Weld has injected a
    // proxy object for the TemporaryStringCalculator implementation:
    //
    //   Servlet.java:NN: Servlet.<init> ()void: null
    //   Servlet.java:NN: Servlet.init (ServletConfig)void:
    //     TemporaryStringCalculator$Proxy$_$$_WeldClientProxy
    //
    // So when it comes to servlet implementations running in production, we
    // can't @Inject objects via constructor injection. As I understand it,
    // other objects can still use constructor injection, but Servlet
    // implementations are a special case.
    private static void printMethodAndCalculatorClass(StringCalculator calc) {
        var caller = StackWalker
                .getInstance(StackWalker.Option.RETAIN_CLASS_REFERENCE)
                .walk(s -> s.skip(1).findFirst())
                .orElseThrow();

        System.out.printf(
                "%s:%d: %s.%s %s: %s%n",
                caller.getFileName(),
                caller.getLineNumber(),
                caller.getDeclaringClass().getSimpleName(),
                caller.getMethodName(),
                caller.getMethodType(),
                calc == null ? "null" : calc.getClass().getSimpleName()
        );
    }
}
