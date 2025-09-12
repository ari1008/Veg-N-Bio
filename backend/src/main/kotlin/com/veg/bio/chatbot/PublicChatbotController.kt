package com.veg.bio.chatbot

import com.veg.bio.chatbot.dto.DiagnoseRequestDto
import com.veg.bio.chatbot.dto.DiagnoseResponseDto
import com.veg.bio.chatbot.dto.ReportErrorDto
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notprotected/chatbot")
class PublicChatbotController(
    private val chatbotService: ChatbotService
) {

    @PostMapping("/diagnose")
    fun diagnose(@Valid @RequestBody request: DiagnoseRequestDto): ResponseEntity<DiagnoseResponseDto> {
        val result = chatbotService.diagnose(request)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/report")
    fun reportError(@Valid @RequestBody reportDto: ReportErrorDto): ResponseEntity<Map<String, String>> {
        chatbotService.reportError(reportDto)
        return ResponseEntity.ok(mapOf("message" to "Merci pour votre retour !"))
    }

    @GetMapping("/races")
    fun getAvailableRaces(): ResponseEntity<List<String>> {
        val races = chatbotService.getAvailableRaces()
        return ResponseEntity.ok(races)
    }

    @GetMapping("/symptoms")
    fun getAvailableSymptoms(): ResponseEntity<List<String>> {
        val symptoms = chatbotService.getAvailableSymptoms()
        return ResponseEntity.ok(symptoms)
    }
}