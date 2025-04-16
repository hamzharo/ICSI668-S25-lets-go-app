package com.carsharing.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST) // 400 Bad Request is suitable for booking logic errors
public class BookingException extends RuntimeException {
    public BookingException(String message) {
        super(message);
    }
}