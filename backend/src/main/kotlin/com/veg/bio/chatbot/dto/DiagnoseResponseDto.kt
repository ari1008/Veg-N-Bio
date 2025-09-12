package com.veg.bio.chatbot.dto

data class DiagnoseResponseDto(
    val sessionId: String,
    val possibleDiseases: List<DiseaseResultDto>,
    val shouldConsultVet: Boolean,
    val generalAdvice: String
)