package com.veg.bio.chatbot

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.veg.bio.chatbot.dto.*
import com.veg.bio.infrastructure.repository.ChatbotReportRepository
import com.veg.bio.infrastructure.repository.ChatbotSessionRepository
import com.veg.bio.infrastructure.repository.VetDiseaseRepository
import com.veg.bio.infrastructure.table.VetDiseaseEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.util.*

@Service
class ChatbotAdminService(
    private val vetDiseaseRepository: VetDiseaseRepository,
    private val chatbotSessionRepository: ChatbotSessionRepository,
    private val chatbotReportRepository: ChatbotReportRepository
) {

    fun getAllDiseases(pageable: Pageable): Page<VetDiseaseDto> {
        return vetDiseaseRepository.findAll(pageable).map { entity ->
            VetDiseaseDto(
                id = entity.id!!,
                name = entity.name,
                description = entity.description,
                symptoms = entity.symptoms,
                affectedRaces = entity.affectedRaces,
                urgency = entity.urgency.name,
                advice = entity.advice,
                prevention = entity.prevention
            )
        }
    }

    fun createDisease(request: CreateDiseaseDto): VetDiseaseDto {
        val entity = VetDiseaseEntity(
            name = request.name,
            description = request.description,
            symptoms = request.symptoms,
            affectedRaces = request.affectedRaces,
            urgency = request.urgency,
            advice = request.advice,
            prevention = request.prevention
        )

        val saved = vetDiseaseRepository.save(entity)
        return VetDiseaseDto(
            id = saved.id!!,
            name = saved.name,
            description = saved.description,
            symptoms = saved.symptoms,
            affectedRaces = saved.affectedRaces,
            urgency = saved.urgency.name,
            advice = saved.advice,
            prevention = saved.prevention
        )
    }

    fun updateDisease(id: UUID, request: UpdateDiseaseDto): VetDiseaseDto {
        val existing = vetDiseaseRepository.findById(id)
            .orElseThrow { RuntimeException("Maladie non trouvée") }

        val updated = existing.copy(
            name = request.name ?: existing.name,
            description = request.description ?: existing.description,
            symptoms = request.symptoms ?: existing.symptoms,
            affectedRaces = request.affectedRaces ?: existing.affectedRaces,
            urgency = request.urgency ?: existing.urgency,
            advice = request.advice ?: existing.advice,
            prevention = request.prevention ?: existing.prevention
        )

        val saved = vetDiseaseRepository.save(updated)
        return VetDiseaseDto(
            id = saved.id!!,
            name = saved.name,
            description = saved.description,
            symptoms = saved.symptoms,
            affectedRaces = saved.affectedRaces,
            urgency = saved.urgency.name,
            advice = saved.advice,
            prevention = saved.prevention
        )
    }

    fun deleteDisease(id: UUID) {
        if (!vetDiseaseRepository.existsById(id)) {
            throw RuntimeException("Maladie non trouvée")
        }
        vetDiseaseRepository.deleteById(id)
    }

    fun getSessionsStats(startDate: String?, endDate: String?): ChatbotStatsDto {
        val totalSessions = chatbotSessionRepository.count()
        val totalReports = chatbotReportRepository.count()

        return ChatbotStatsDto(
            totalSessions = totalSessions,
            totalReports = totalReports,
            averageDiagnosisTime = 2.5,
            mostCommonRace = "chat européen",
            mostCommonSymptom = "vomissements",
            accuracyRate = if (totalSessions > 0) {
                ((totalSessions - totalReports).toDouble() / totalSessions * 100)
            } else 0.0
        )
    }

    fun getSessions(pageable: Pageable): Page<ChatbotSessionDto> {
        return chatbotSessionRepository.findAll(pageable).map { session ->
            val hasReports = chatbotReportRepository.existsBySessionId(session.id!!)
            ChatbotSessionDto(
                id = session.id!!,
                race = session.race,
                symptoms = session.symptoms,
                createdAt = session.createdAt,
                hasReports = hasReports
            )
        }
    }

    fun getSessionDetail(id: UUID): ChatbotSessionDetailDto {
        val session = chatbotSessionRepository.findById(id)
            .orElseThrow { RuntimeException("Session non trouvée") }

        val reports = chatbotReportRepository.findBySessionId(id).map { report ->
            ChatbotReportDto(
                id = report.id!!,
                sessionId = report.sessionId,
                feedback = report.feedback,
                actualDiagnosis = report.actualDiagnosis,
                resolved = false,
                resolution = null,
                createdAt = report.createdAt
            )
        }

        val diagnosisResult = jacksonObjectMapper().readValue<List<DiseaseResultDto>>(session.diagnosisResult)

        return ChatbotSessionDetailDto(
            id = session.id!!,
            race = session.race,
            symptoms = session.symptoms,
            diagnosisResult = diagnosisResult,
            createdAt = session.createdAt,
            reports = reports
        )
    }

    fun getReports(resolved: Boolean, pageable: Pageable): Page<ChatbotReportDto> {
        return chatbotReportRepository.findAll(pageable).map { report ->
            ChatbotReportDto(
                id = report.id!!,
                sessionId = report.sessionId,
                feedback = report.feedback,
                actualDiagnosis = report.actualDiagnosis,
                resolved = false,
                resolution = null,
                createdAt = report.createdAt
            )
        }
    }

    fun resolveReport(id: UUID, resolution: ResolveReportDto) {
        chatbotReportRepository.findById(id)
            .orElseThrow { RuntimeException("Signalement non trouvé") }


        println("Signalement $id résolu : ${resolution.resolution}")
    }

    fun getPopularSymptoms(): List<SymptomStatsDto> {
        return listOf(
            SymptomStatsDto("vomissements", 45, 23.4),
            SymptomStatsDto("diarrhee", 38, 19.8),
            SymptomStatsDto("toux", 32, 16.7)
        )
    }

    fun getPopularRaces(): List<RaceStatsDto> {
        return listOf(
            RaceStatsDto("chat européen", 67, 34.9),
            RaceStatsDto("labrador", 23, 12.0),
            RaceStatsDto("berger allemand", 18, 9.4)
        )
    }

    fun getAccuracyStats(): AccuracyStatsDto {
        val totalDiagnoses = chatbotSessionRepository.count()
        val reportedErrors = chatbotReportRepository.count()
        val accuracyRate = if (totalDiagnoses > 0) {
            ((totalDiagnoses - reportedErrors).toDouble() / totalDiagnoses * 100)
        } else 0.0

        return AccuracyStatsDto(
            totalDiagnoses = totalDiagnoses,
            reportedErrors = reportedErrors,
            accuracyRate = accuracyRate,
            improvementSuggestions = listOf(
                "Ajouter plus de symptômes spécifiques par race",
                "Améliorer la correspondance des symptômes",
                "Inclure plus de maladies communes"
            )
        )
    }
}
