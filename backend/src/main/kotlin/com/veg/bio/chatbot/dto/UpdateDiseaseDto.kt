package com.veg.bio.chatbot.dto

import com.veg.bio.infrastructure.table.UrgencyLevel

data class UpdateDiseaseDto(
    val name: String? = null,
    val description: String? = null,
    val symptoms: List<String>? = null,
    val affectedRaces: List<String>? = null,
    val urgency: UrgencyLevel? = null,
    val advice: String? = null,
    val prevention: String? = null
)
