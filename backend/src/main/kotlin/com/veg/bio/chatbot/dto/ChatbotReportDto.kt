package com.veg.bio.chatbot.dto

import java.time.LocalDateTime
import java.util.UUID

data class ChatbotReportDto(
    val id: UUID,
    val sessionId: UUID,
    val feedback: String,
    val actualDiagnosis: String?,
    val resolved: Boolean,
    val resolution: String?,
    val createdAt: LocalDateTime
)

