package com.veg.bio.chatbot.dto

import java.util.UUID

data class VetDiseaseDto(
    val id: UUID,
    val name: String,
    val description: String,
    val symptoms: List<String>,
    val affectedRaces: List<String>,
    val urgency: String,
    val advice: String,
    val prevention: String?
)