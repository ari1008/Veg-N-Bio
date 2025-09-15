package com.veg.bio.configuration

import com.veg.bio.authentification.ErrorLogin
import com.veg.bio.authentification.ErrorPlatformForThisUser
import com.veg.bio.authentification.UserExist
import com.veg.bio.keycloak.ErrorKeycloak
import com.veg.bio.keycloak.ErrorRefreshToken
import com.veg.bio.menu.NotGoodPrice
import com.veg.bio.reservation.InsufficientCapacityException
import com.veg.bio.reservation.InvalidReservationTimeException
import com.veg.bio.reservation.ReservationConflictException
import com.veg.bio.reservation.ReservationNotFoundException
import com.veg.bio.reservation.RestaurantClosedException
import com.veg.bio.reservation.UnauthorizedReservationAccessException
import com.veg.bio.review.DuplicateReviewException
import com.veg.bio.review.InvalidModerationException
import com.veg.bio.review.InvalidReviewDataException
import com.veg.bio.review.ResourceNotFoundException
import com.veg.bio.review.ReviewNotFoundException
import com.veg.bio.user.NotFoundUserWithClientId
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.LocalDateTime

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

    @ExceptionHandler(NotFoundUserWithClientId::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleNotFoundUserWithClientId(): Map<String, String> {
        return mapOf(
            "error" to "User not found with clientId"
        )
    }

    @ExceptionHandler(NotGoodPrice::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleNotGoodPrice(): Map<String, String> {
        print("hello")
        return mapOf(
            "error" to "Not good price the price is between 3 and 10000"
        )
    }

    @ExceptionHandler(ReservationNotFoundException::class)
    fun handleReservationNotFound(ex: ReservationNotFoundException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(mapOf("error" to "NOT_FOUND", "message" to ex.message!!))
    }

    @ExceptionHandler(ReservationConflictException::class)
    fun handleReservationConflict(ex: ReservationConflictException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(mapOf("error" to "CONFLICT", "message" to ex.message!!))
    }

    @ExceptionHandler(UnauthorizedReservationAccessException::class)
    fun handleUnauthorizedAccess(ex: UnauthorizedReservationAccessException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(mapOf("error" to "FORBIDDEN", "message" to ex.message!!))
    }

    @ExceptionHandler(InvalidReservationTimeException::class, RestaurantClosedException::class, InsufficientCapacityException::class)
    fun handleBadRequest(ex: RuntimeException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(mapOf("error" to "BAD_REQUEST", "message" to ex.message!!))
    }

    @ExceptionHandler(DuplicateReviewException::class)
    fun handleDuplicateReview(ex: DuplicateReviewException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            error = "DUPLICATE_REVIEW",
            message = "Vous avez déjà laissé un avis pour cette ressource",
            details = mapOf(
                "userId" to ex.userId,
                "resourceType" to ex.resourceType,
                "resourceId" to ex.resourceId
            ),
            timestamp = LocalDateTime.now(),
            status = HttpStatus.CONFLICT.value()
        )
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error)
    }

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(ex: ResourceNotFoundException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            error = "RESOURCE_NOT_FOUND",
            message = "${ex.resourceType} non trouvé",
            details = mapOf(
                "resourceType" to ex.resourceType,
                "resourceId" to ex.resourceId
            ),
            timestamp = LocalDateTime.now(),
            status = HttpStatus.NOT_FOUND.value()
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error)
    }

    @ExceptionHandler(InvalidReviewDataException::class)
    fun handleInvalidReviewData(ex: InvalidReviewDataException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            error = "INVALID_DATA",
            message = "Données invalides",
            details = mapOf(
                "field" to ex.field,
                "value" to ex.value,
                "constraint" to ex.constraint
            ),
            timestamp = LocalDateTime.now(),
            status = HttpStatus.BAD_REQUEST.value()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error)
    }

    @ExceptionHandler(ReviewNotFoundException::class)
    fun handleReviewNotFound(ex: ReviewNotFoundException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            error = "REVIEW_NOT_FOUND",
            message = "Avis non trouvé",
            details = mapOf(
                "reviewId" to ex.reviewId
            ),
            timestamp = LocalDateTime.now(),
            status = HttpStatus.NOT_FOUND.value()
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error)
    }

    @ExceptionHandler(InvalidModerationException::class)
    fun handleInvalidModeration(ex: InvalidModerationException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            error = "INVALID_MODERATION",
            message = "Opération de modération invalide",
            details = mapOf(
                "reviewId" to ex.reviewId,
                "reason" to ex.reason
            ),
            timestamp = LocalDateTime.now(),
            status = HttpStatus.BAD_REQUEST.value()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationErrors(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val fieldErrors = ex.bindingResult.fieldErrors.associate {
            it.field to (it.defaultMessage ?: "Valeur invalide")
        }

        val error = ErrorResponse(
            error = "VALIDATION_ERROR",
            message = "Erreurs de validation",
            details = mapOf(
                "fieldErrors" to fieldErrors
            ),
            timestamp = LocalDateTime.now(),
            status = HttpStatus.BAD_REQUEST.value()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericError(ex: Exception): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            error = "INTERNAL_ERROR",
            message = "Erreur interne du serveur",
            details = mapOf(
                "cause" to (ex.message ?: "Erreur inconnue")
            ),
            timestamp = LocalDateTime.now(),
            status = HttpStatus.INTERNAL_SERVER_ERROR.value()
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error)
    }
}

data class ErrorResponse(
    val error: String,
    val message: String,
    val details: Map<String, Any?> = emptyMap(),
    val timestamp: LocalDateTime,
    val status: Int
)
