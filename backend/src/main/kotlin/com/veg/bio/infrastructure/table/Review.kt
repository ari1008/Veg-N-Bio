package com.veg.bio.infrastructure.table

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "reviews", indexes = [
    Index(name = "idx_review_resource", columnList = "resource_type, resource_id"),
    Index(name = "idx_review_user", columnList = "user_id"),
    Index(name = "idx_review_status", columnList = "status")
])
data class Review(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 32)
    val resourceType: ResourceType,

    @Column(name = "resource_id", nullable = false)
    val resourceId: UUID,

    @Column(name = "rating", nullable = false)
    val rating: Int, // 1 à 5

    @Column(name = "comment", length = 1000)
    val comment: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    var status: ReviewStatus = ReviewStatus.PENDING,

    @Column(name = "moderated_by")
    var moderatedBy: UUID? = null,

    @Column(name = "moderated_at")
    var moderatedAt: LocalDateTime? = null,

    @Column(name = "moderation_reason", length = 500)
    var moderationReason: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {

    init {
        require(rating in 1..5) { "La note doit être entre 1 et 5" }
        val commentValue = comment
        require(commentValue == null || commentValue.length <= 1000) {
            "Le commentaire ne peut pas dépasser 1000 caractères"
        }
    }

    fun approve(moderatorId: UUID, reason: String? = null) {
        status = ReviewStatus.APPROVED
        moderatedBy = moderatorId
        moderatedAt = LocalDateTime.now()
        moderationReason = reason
    }

    fun reject(moderatorId: UUID, reason: String) {
        status = ReviewStatus.REJECTED
        moderatedBy = moderatorId
        moderatedAt = LocalDateTime.now()
        moderationReason = reason
    }
}

enum class ResourceType {
    RESTAURANT,
    DISH
}

enum class ReviewStatus {
    PENDING,
    APPROVED,
    REJECTED
}