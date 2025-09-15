package com.veg.bio.review

import com.veg.bio.infrastructure.repository.DishRepository
import com.veg.bio.infrastructure.repository.RestaurantRepository
import com.veg.bio.infrastructure.repository.ReviewRepository
import com.veg.bio.infrastructure.table.ResourceType
import com.veg.bio.infrastructure.table.Review
import com.veg.bio.infrastructure.table.ReviewStatus
import com.veg.bio.review.dto.CreateReviewDto
import com.veg.bio.review.dto.ModerationDto
import com.veg.bio.review.dto.ReviewDto
import com.veg.bio.review.dto.ReviewStatsDto
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@Transactional(readOnly = true)
class ReviewService(
    private val reviewRepository: ReviewRepository,
    private val restaurantRepository: RestaurantRepository,
    private val dishRepository: DishRepository
) {

    @Transactional
    fun createReview(createReviewDto: CreateReviewDto): ReviewDto {
        if (reviewRepository.existsByUserIdAndResourceTypeAndResourceId(
                createReviewDto.userId,
                createReviewDto.resourceType,
                createReviewDto.resourceId
            )) {
            throw IllegalArgumentException("Vous avez déjà laissé un avis pour cette ressource")
        }

        when (createReviewDto.resourceType) {
            ResourceType.RESTAURANT -> {
                if (!restaurantRepository.existsById(createReviewDto.resourceId)) {
                    throw IllegalArgumentException("Restaurant non trouvé avec l'ID: ${createReviewDto.resourceId}")
                }
            }
            ResourceType.DISH -> {
                if (!dishRepository.existsById(createReviewDto.resourceId)) {
                    throw IllegalArgumentException("Plat non trouvé avec l'ID: ${createReviewDto.resourceId}")
                }
            }
        }

        val review = Review(
            userId = createReviewDto.userId,
            resourceType = createReviewDto.resourceType,
            resourceId = createReviewDto.resourceId,
            rating = createReviewDto.rating,
            comment = createReviewDto.comment?.takeIf { it.isNotBlank() },
            status = ReviewStatus.PENDING
        )

        val savedReview = reviewRepository.save(review)
        return mapToDto(savedReview)
    }

    fun getApprovedReviews(
        resourceType: ResourceType,
        resourceId: UUID,
        page: Int = 0,
        size: Int = 20
    ): Page<ReviewDto> {
        validateResourceExists(resourceType, resourceId)

        val pageable: Pageable = PageRequest.of(page, size)
        val reviews = reviewRepository.findByResourceTypeAndResourceIdAndStatusOrderByCreatedAtDesc(
            resourceType, resourceId, ReviewStatus.APPROVED, pageable
        )
        return reviews.map { mapToDto(it) }
    }

    fun getAllApprovedReviews(
        resourceType: ResourceType,
        resourceId: UUID
    ): List<ReviewDto> {
        validateResourceExists(resourceType, resourceId)

        val reviews = reviewRepository.findByResourceTypeAndResourceIdAndStatusOrderByCreatedAtDesc(
            resourceType, resourceId, ReviewStatus.APPROVED
        )
        return reviews.map { mapToDto(it) }
    }

    fun getReviewStats(
        resourceType: ResourceType,
        resourceId: UUID
    ): ReviewStatsDto {
        validateResourceExists(resourceType, resourceId)

        val averageRating = reviewRepository.getAverageRating(resourceType, resourceId) ?: 0.0
        val totalReviews = reviewRepository.getTotalReviews(resourceType, resourceId).toInt()

        val ratingsDistributionRaw = reviewRepository.getRatingsDistribution(resourceType, resourceId)
        val ratingsDistribution = ratingsDistributionRaw.associate {
            (it[0] as Int) to (it[1] as Long).toInt()
        }

        return ReviewStatsDto(
            averageRating = averageRating,
            totalReviews = totalReviews,
            ratingsDistribution = ratingsDistribution
        )
    }

    fun userHasReviewed(
        userId: UUID,
        resourceType: ResourceType,
        resourceId: UUID
    ): Boolean {
        validateResourceExists(resourceType, resourceId)

        return reviewRepository.existsByUserIdAndResourceTypeAndResourceId(
            userId, resourceType, resourceId
        )
    }


    fun getPendingReviews(page: Int = 0, size: Int = 20): Page<ReviewDto> {
        val pageable: Pageable = PageRequest.of(page, size)
        val reviews = reviewRepository.findByStatusOrderByCreatedAtAsc(ReviewStatus.PENDING, pageable)
        return reviews.map { mapToDto(it) }
    }

    @Transactional
    fun moderateReview(reviewId: UUID, moderationDto: ModerationDto, currentUserId: String): ReviewDto {
        val review = reviewRepository.findById(reviewId)
            .orElseThrow { IllegalArgumentException("Avis non trouvé") }

        if (review.status != ReviewStatus.PENDING) {
            throw IllegalArgumentException("Cet avis a déjà été modéré")
        }

        when (moderationDto.status) {
            ReviewStatus.APPROVED -> review.approve(UUID.fromString(currentUserId), moderationDto.reason)
            ReviewStatus.REJECTED -> review.reject(UUID.fromString(currentUserId), moderationDto.reason!!)
            else -> throw IllegalArgumentException("Statut de modération invalide")
        }

        val savedReview = reviewRepository.save(review)
        return mapToDto(savedReview)
    }

    fun getModerationStats(): Map<String, Any> {
        val pendingCount = reviewRepository.countByStatus(ReviewStatus.PENDING)
        val approvedCount = reviewRepository.countByStatus(ReviewStatus.APPROVED)
        val rejectedCount = reviewRepository.countByStatus(ReviewStatus.REJECTED)
        val oldPendingCount = reviewRepository.countOldPendingReviews(
            java.time.LocalDateTime.now().minusDays(7)
        )

        return mapOf(
            "pending" to pendingCount,
            "approved" to approvedCount,
            "rejected" to rejectedCount,
            "oldPending" to oldPendingCount,
            "totalProcessed" to (approvedCount + rejectedCount)
        )
    }

    private fun validateResourceExists(resourceType: ResourceType, resourceId: UUID) {
        when (resourceType) {
            ResourceType.RESTAURANT -> {
                if (!restaurantRepository.existsById(resourceId)) {
                    throw IllegalArgumentException("Restaurant non trouvé avec l'ID: $resourceId")
                }
            }
            ResourceType.DISH -> {
                if (!dishRepository.existsById(resourceId)) {
                    throw IllegalArgumentException("Plat non trouvé avec l'ID: $resourceId")
                }
            }
        }
    }

    private fun mapToDto(review: Review): ReviewDto {
        return ReviewDto(
            id = review.id!!,
            userId = review.userId,
            resourceType = review.resourceType,
            resourceId = review.resourceId,
            rating = review.rating,
            comment = review.comment,
            status = review.status,
            moderatedBy = review.moderatedBy,
            moderatedAt = review.moderatedAt,
            moderationReason = review.moderationReason,
            createdAt = review.createdAt,
            updatedAt = review.updatedAt
        )
    }
}