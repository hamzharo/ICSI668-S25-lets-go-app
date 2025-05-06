package com.carsharing.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST) // Return 400 Bad Request
public class IllegalRideStateException extends RuntimeException {
    public IllegalRideStateException(String message) {
        super(message);
    }
}