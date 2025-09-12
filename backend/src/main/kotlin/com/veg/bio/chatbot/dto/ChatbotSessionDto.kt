package com.veg.bio.chatbot.dto

import java.time.LocalDateTime
import java.util.UUID

data class ChatbotSessionDto(
    val id: UUID,
    val race: String,
    val symptoms: List<String>,
    val createdAt: LocalDateTime,
    val hasReports: Boolean
)