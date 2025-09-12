package com.veg.bio.chatbot.dto

data class SymptomStatsDto(
    val symptom: String,
    val count: Long,
    val percentage: Double
)
