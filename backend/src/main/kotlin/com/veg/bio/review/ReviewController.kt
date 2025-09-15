package com.veg.bio.review.controller

import com.veg.bio.annotation.CurrentUserId
import com.veg.bio.infrastructure.table.ResourceType
import com.veg.bio.review.ReviewService
import com.veg.bio.review.dto.CreateReviewDto
import com.veg.bio.review.dto.ModerationDto
import com.veg.bio.review.dto.ReviewDto
import com.veg.bio.review.dto.ReviewStatsDto
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api")
class ReviewController(
    private val reviewService: ReviewService
) {

    @PostMapping("/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    fun createReview(@Valid @RequestBody createReviewDto: CreateReviewDto): ResponseEntity<ReviewDto> {
        val review = reviewService.createReview(createReviewDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(review)
    }

    @GetMapping("/reviews/{resourceType}/{resourceId}")
    fun getReviews(
        @PathVariable resourceType: ResourceType,
        @PathVariable resourceId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<ReviewDto>> {
        val reviews = reviewService.getApprovedReviews(resourceType, resourceId, page, size)
        return ResponseEntity.ok(reviews)
    }

    @GetMapping("/reviews/{resourceType}/{resourceId}/all")
    fun getAllReviews(
        @PathVariable resourceType: ResourceType,
        @PathVariable resourceId: UUID
    ): ResponseEntity<List<ReviewDto>> {
        val reviews = reviewService.getAllApprovedReviews(resourceType, resourceId)
        return ResponseEntity.ok(reviews)
    }

    @GetMapping("/reviews/{resourceType}/{resourceId}/stats")
    fun getReviewStats(
        @PathVariable resourceType: ResourceType,
        @PathVariable resourceId: UUID
    ): ResponseEntity<ReviewStatsDto> {
        val stats = reviewService.getReviewStats(resourceType, resourceId)
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/reviews/{resourceType}/{resourceId}/user/{userId}/exists")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('RESTAURANT_OWNER')")
    fun userHasReviewed(
        @PathVariable resourceType: ResourceType,
        @PathVariable resourceId: UUID,
        @PathVariable userId: UUID
    ): ResponseEntity<Map<String, Boolean>> {
        val hasReviewed = reviewService.userHasReviewed(userId, resourceType, resourceId)
        return ResponseEntity.ok(mapOf("hasReviewed" to hasReviewed))
    }


    @GetMapping("/admin/reviews/pending")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    fun getPendingReviews(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<ReviewDto>> {
        val reviews = reviewService.getPendingReviews(page, size)
        return ResponseEntity.ok(reviews)
    }

    @PutMapping("/admin/reviews/{reviewId}/moderate")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    fun moderateReview(
        @PathVariable reviewId: UUID,
        @Valid @RequestBody moderationDto: ModerationDto,
        @CurrentUserId currentUserId: String
    ): ResponseEntity<ReviewDto> {
        val review = reviewService.moderateReview(reviewId, moderationDto, currentUserId)
        return ResponseEntity.ok(review)
    }

    @GetMapping("/admin/reviews/stats")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    fun getModerationStats(): ResponseEntity<Map<String, Any>> {
        val stats = reviewService.getModerationStats()
        return ResponseEntity.ok(stats)
    }
}