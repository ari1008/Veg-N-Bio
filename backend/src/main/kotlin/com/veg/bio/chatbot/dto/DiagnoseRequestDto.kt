package com.veg.bio.chatbot.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty

data class DiagnoseRequestDto(
    @field:NotBlank(message = "La race est obligatoire")
    val race: String,

    @field:NotEmpty(message = "Au moins un symptôme doit être fourni")
    val symptoms: List<String>
)