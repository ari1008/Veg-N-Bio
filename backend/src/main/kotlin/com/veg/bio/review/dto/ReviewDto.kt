package com.veg.bio.review.dto

import com.veg.bio.infrastructure.table.ResourceType
import com.veg.bio.infrastructure.table.ReviewStatus
import java.time.LocalDateTime
import java.util.UUID

data class ReviewDto(
    val id: UUID,
    val userId: UUID,
    val resourceType: ResourceType,
    val resourceId: UUID,
    val rating: Int,
    val comment: String?,
    val status: ReviewStatus,
    val moderatedBy: UUID?,
    val moderatedAt: LocalDateTime?,
    val moderationReason: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)
