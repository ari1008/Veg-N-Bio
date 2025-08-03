package com.veg.bio.configuration

import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleIllegalArgument(ex: IllegalArgumentException): Map<String, String> {
        return mapOf(
            "error" to "Validation error",
            "message" to ex.message.orEmpty()
        )
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleDeserializationError(ex: HttpMessageNotReadableException): Map<String, String> {
        return mapOf(
            "error" to "Invalid input",
            "message" to (ex.mostSpecificCause?.message ?: "Malformed JSON")
        )
    }
}
