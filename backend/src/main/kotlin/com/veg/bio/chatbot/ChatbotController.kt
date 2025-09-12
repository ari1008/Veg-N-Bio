package com.veg.bio.chatbot

import com.veg.bio.chatbot.dto.*
import com.veg.bio.keycloak.ROLE_RESTAURANT_OWNER
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/admin/chatbot")
@PreAuthorize("hasRole('${ROLE_RESTAURANT_OWNER}')")
class AdminChatbotController(
    private val chatbotService: ChatbotService,
    private val chatbotAdminService: ChatbotAdminService
) {
    
    @GetMapping("/diseases")
    fun getAllDiseases(pageable: Pageable): ResponseEntity<Page<VetDiseaseDto>> {
        val diseases = chatbotAdminService.getAllDiseases(pageable)
        return ResponseEntity.ok(diseases)
    }

    @PostMapping("/diseases")
    fun createDisease(@Valid @RequestBody request: CreateDiseaseDto): ResponseEntity<VetDiseaseDto> {
        val disease = chatbotAdminService.createDisease(request)
        return ResponseEntity.ok(disease)
    }

    @PutMapping("/diseases/{id}")
    fun updateDisease(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateDiseaseDto
    ): ResponseEntity<VetDiseaseDto> {
        val disease = chatbotAdminService.updateDisease(id, request)
        return ResponseEntity.ok(disease)
    }

    @DeleteMapping("/diseases/{id}")
    fun deleteDisease(@PathVariable id: UUID): ResponseEntity<Map<String, String>> {
        chatbotAdminService.deleteDisease(id)
        return ResponseEntity.ok(mapOf("message" to "Maladie supprimée"))
    }

    @GetMapping("/sessions/stats")
    fun getSessionsStats(
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?
    ): ResponseEntity<ChatbotStatsDto> {
        val stats = chatbotAdminService.getSessionsStats(startDate, endDate)
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/sessions")
    fun getSessions(pageable: Pageable): ResponseEntity<Page<ChatbotSessionDto>> {
        val sessions = chatbotAdminService.getSessions(pageable)
        return ResponseEntity.ok(sessions)
    }

    @GetMapping("/sessions/{id}")
    fun getSessionDetail(@PathVariable id: UUID): ResponseEntity<ChatbotSessionDetailDto> {
        val session = chatbotAdminService.getSessionDetail(id)
        return ResponseEntity.ok(session)
    }

    @GetMapping("/reports")
    fun getReports(
        @RequestParam(defaultValue = "false") resolved: Boolean,
        pageable: Pageable
    ): ResponseEntity<Page<ChatbotReportDto>> {
        val reports = chatbotAdminService.getReports(resolved, pageable)
        return ResponseEntity.ok(reports)
    }

    @PutMapping("/reports/{id}/resolve")
    fun resolveReport(
        @PathVariable id: UUID,
        @RequestBody resolution: ResolveReportDto
    ): ResponseEntity<Map<String, String>> {
        chatbotAdminService.resolveReport(id, resolution)
        return ResponseEntity.ok(mapOf("message" to "Signalement traité"))
    }


    @GetMapping("/analytics/popular-symptoms")
    fun getPopularSymptoms(): ResponseEntity<List<SymptomStatsDto>> {
        val stats = chatbotAdminService.getPopularSymptoms()
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/analytics/popular-races")
    fun getPopularRaces(): ResponseEntity<List<RaceStatsDto>> {
        val stats = chatbotAdminService.getPopularRaces()
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/analytics/accuracy")
    fun getAccuracyStats(): ResponseEntity<AccuracyStatsDto> {
        val stats = chatbotAdminService.getAccuracyStats()
        return ResponseEntity.ok(stats)
    }


}