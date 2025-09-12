package com.veg.bio.chatbot.dto

data class AccuracyStatsDto(
    val totalDiagnoses: Long,
    val reportedErrors: Long,
    val accuracyRate: Double,
    val improvementSuggestions: List<String>
)
