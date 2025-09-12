package com.veg.bio.chatbot.dto

data class DiseaseResultDto(
    val name: String,
    val description: String,
    val probability: Int,
    val urgency: String,
    val advice: String
)
