package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.ResourceType
import com.veg.bio.infrastructure.table.Review
import com.veg.bio.infrastructure.table.ReviewStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ReviewRepository : JpaRepository<Review, UUID> {


    fun findByResourceTypeAndResourceIdAndStatusOrderByCreatedAtDesc(
        resourceType: ResourceType,
        resourceId: UUID,
        status: ReviewStatus,
        pageable: Pageable
    ): Page<Review>

    fun findByResourceTypeAndResourceIdAndStatusOrderByCreatedAtDesc(
        resourceType: ResourceType,
        resourceId: UUID,
        status: ReviewStatus
    ): List<Review>

    fun existsByUserIdAndResourceTypeAndResourceId(
        userId: UUID,
        resourceType: ResourceType,
        resourceId: UUID
    ): Boolean


    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.resourceType = :resourceType AND r.resourceId = :resourceId AND r.status = 'APPROVED'")
    fun getAverageRating(
        @Param("resourceType") resourceType: ResourceType,
        @Param("resourceId") resourceId: UUID
    ): Double?

    @Query("SELECT COUNT(r) FROM Review r WHERE r.resourceType = :resourceType AND r.resourceId = :resourceId AND r.status = 'APPROVED'")
    fun getTotalReviews(
        @Param("resourceType") resourceType: ResourceType,
        @Param("resourceId") resourceId: UUID
    ): Long

    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.resourceType = :resourceType AND r.resourceId = :resourceId AND r.status = 'APPROVED' GROUP BY r.rating")
    fun getRatingsDistribution(
        @Param("resourceType") resourceType: ResourceType,
        @Param("resourceId") resourceId: UUID
    ): List<Array<Any>>


    fun findByStatusOrderByCreatedAtAsc(status: ReviewStatus, pageable: Pageable): Page<Review>

    fun countByStatus(status: ReviewStatus): Long

    @Query("SELECT COUNT(r) FROM Review r WHERE r.status = 'PENDING' AND r.createdAt < :cutoffDate")
    fun countOldPendingReviews(@Param("cutoffDate") cutoffDate: java.time.LocalDateTime): Long
}