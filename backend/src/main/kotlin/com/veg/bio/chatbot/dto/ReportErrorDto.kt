package com.veg.bio.chatbot.dto

import jakarta.validation.constraints.NotBlank

data class ReportErrorDto(
    @field:NotBlank(message = "L'ID de session est obligatoire")
    val sessionId: String,

    @field:NotBlank(message = "Le feedback est obligatoire")
    val feedback: String,

    val actualDiagnosis: String? = null
)