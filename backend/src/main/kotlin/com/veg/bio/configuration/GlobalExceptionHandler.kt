package com.veg.bio.configuration

import com.veg.bio.authentification.ErrorLogin
import com.veg.bio.authentification.ErrorPlatformForThisUser
import com.veg.bio.authentification.UserExist
import com.veg.bio.keycloak.ErrorKeycloak
import com.veg.bio.keycloak.ErrorRefreshToken
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

    @ExceptionHandler(ErrorKeycloak::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleErrorKeycloak(): Map<String, String>{
        return mapOf(
            "error" to "Invalid Keycloak"
        )
    }

    @ExceptionHandler(ErrorRefreshToken::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleErrorRefreshToken(): Map<String, String>{
        return mapOf(
            "error" to "Error Refresh token"
        )
    }

    @ExceptionHandler(ErrorLogin::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleErrorLogin(): Map<String, String>{
        return mapOf(
            "error" to "Is not good login"
        )
    }

    @ExceptionHandler(UserExist::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleUserExist(): Map<String, String>{
        return mapOf(
            "error" to "User with email or username exist"
        )
    }

    @ExceptionHandler(ErrorPlatformForThisUser::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handleErrorPlatformForThisUser(): Map<String, String> {
        return mapOf(
            "error" to "User is not good for this plateforme"
        )
    }
}
