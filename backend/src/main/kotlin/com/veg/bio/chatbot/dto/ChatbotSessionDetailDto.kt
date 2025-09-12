package com.veg.bio.chatbot.dto

import java.time.LocalDateTime
import java.util.UUID

data class ChatbotSessionDetailDto(
    val id: UUID,
    val race: String,
    val symptoms: List<String>,
    val diagnosisResult: List<DiseaseResultDto>,
    val createdAt: LocalDateTime,
    val reports: List<ChatbotReportDto>
)