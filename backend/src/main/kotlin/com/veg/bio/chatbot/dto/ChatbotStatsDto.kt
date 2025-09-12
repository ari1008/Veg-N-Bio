package com.veg.bio.chatbot.dto

data class ChatbotStatsDto(
    val totalSessions: Long,
    val totalReports: Long,
    val averageDiagnosisTime: Double,
    val mostCommonRace: String,
    val mostCommonSymptom: String,
    val accuracyRate: Double
)