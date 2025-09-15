package com.veg.bio.review


import java.util.*

/**
 * Exception lancée quand une ressource (restaurant/plat) n'existe pas
 */
class ResourceNotFoundException(
    val resourceType: String,
    val resourceId: UUID,
    message: String = "Ressource non trouvée"
) : RuntimeException("$message: $resourceType avec l'ID $resourceId")

/**
 * Exception lancée quand un utilisateur tente de laisser un avis en double
 */
class DuplicateReviewException(
    val userId: UUID,
    val resourceType: String,
    val resourceId: UUID,
    message: String = "Avis déjà existant"
) : RuntimeException("$message: L'utilisateur $userId a déjà laissé un avis pour ce $resourceType ($resourceId)")

/**
 * Exception lancée lors d'opérations de modération invalides
 */
class InvalidModerationException(
    val reviewId: UUID,
    val reason: String,
    message: String = "Modération invalide"
) : RuntimeException("$message pour l'avis $reviewId: $reason")

/**
 * Exception lancée quand un avis n'est pas trouvé
 */
class ReviewNotFoundException(
    val reviewId: UUID,
    message: String = "Avis non trouvé"
) : RuntimeException("$message avec l'ID $reviewId")

/**
 * Exception lancée pour une validation de données invalide
 */
class InvalidReviewDataException(
    val field: String,
    val value: Any?,
    val constraint: String,
    message: String = "Données d'avis invalides"
) : RuntimeException("$message: Le champ '$field' avec la valeur '$value' ne respecte pas la contrainte: $constraint")