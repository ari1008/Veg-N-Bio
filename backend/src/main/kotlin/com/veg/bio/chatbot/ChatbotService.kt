package com.veg.bio.chatbot

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.veg.bio.chatbot.dto.DiagnoseRequestDto
import com.veg.bio.chatbot.dto.DiagnoseResponseDto
import com.veg.bio.chatbot.dto.DiseaseResultDto
import com.veg.bio.chatbot.dto.ReportErrorDto
import com.veg.bio.infrastructure.repository.ChatbotReportRepository
import com.veg.bio.infrastructure.repository.ChatbotSessionRepository
import com.veg.bio.infrastructure.repository.VetDiseaseRepository
import com.veg.bio.infrastructure.table.ChatbotReportEntity
import com.veg.bio.infrastructure.table.ChatbotSessionEntity
import com.veg.bio.infrastructure.table.UrgencyLevel
import com.veg.bio.infrastructure.table.VetDiseaseEntity
import org.springframework.stereotype.Service
import java.util.*
import kotlin.math.min

@Service
class ChatbotService(
    private val vetDiseaseRepository: VetDiseaseRepository,
    private val chatbotSessionRepository: ChatbotSessionRepository,
    private val chatbotReportRepository: ChatbotReportRepository
) {

    fun diagnose(request: DiagnoseRequestDto): DiagnoseResponseDto {
        val race = request.race.lowercase().trim()
        val symptoms = request.symptoms.map { it.lowercase().trim() }

        val possibleDiseases = vetDiseaseRepository.findDiseasesByRace(race)

        val matchedDiseases = calculateDiseaseMatches(possibleDiseases, symptoms, race)

        val sortedDiseases = matchedDiseases.sortedByDescending { it.probability }

        val topDiseases = sortedDiseases.take(3)

        val shouldConsultVet = topDiseases.any { it.urgency == "HIGH" } || topDiseases.isEmpty()


        val generalAdvice = generateGeneralAdvice(topDiseases, shouldConsultVet)

        val session = ChatbotSessionEntity(
            race = request.race,
            symptoms = request.symptoms,
            diagnosisResult = jacksonObjectMapper().writeValueAsString(topDiseases)
        )
        val savedSession = chatbotSessionRepository.save(session)

        return DiagnoseResponseDto(
            sessionId = savedSession.id.toString(),
            possibleDiseases = topDiseases,
            shouldConsultVet = shouldConsultVet,
            generalAdvice = generalAdvice
        )
    }

    fun reportError(reportDto: ReportErrorDto) {
        val sessionId = UUID.fromString(reportDto.sessionId)

        if (!chatbotSessionRepository.existsById(sessionId)) {
            throw ChatbotSessionNotFoundException("Session non trouvée")
        }

        val report = ChatbotReportEntity(
            sessionId = sessionId,
            feedback = reportDto.feedback,
            actualDiagnosis = reportDto.actualDiagnosis
        )

        chatbotReportRepository.save(report)
    }

    private fun calculateDiseaseMatches(
        diseases: List<VetDiseaseEntity>,
        userSymptoms: List<String>,
        race: String
    ): List<DiseaseResultDto> {
        return diseases.mapNotNull { disease ->
            var score = 0.0

            disease.symptoms.forEach { diseaseSymptom ->
                userSymptoms.forEach { userSymptom ->
                    if (userSymptom.contains(diseaseSymptom) || diseaseSymptom.contains(userSymptom)) {
                        score += 1.0
                    }
                }
            }

            if (disease.affectedRaces.contains(race) && !disease.affectedRaces.contains("toutes")) {
                score += 0.5
            }

            if (score > 0) {
                val probability = min((score / disease.symptoms.size * 100).toInt(), 95)

                DiseaseResultDto(
                    name = disease.name,
                    description = disease.description,
                    probability = probability,
                    urgency = disease.urgency.name,
                    advice = disease.advice
                )
            } else null
        }
    }

    private fun generateGeneralAdvice(diseases: List<DiseaseResultDto>, shouldConsultVet: Boolean): String {
        return when {
            diseases.isEmpty() -> "Aucun diagnostic évident basé sur les symptômes fournis. Nous recommandons de consulter un vétérinaire si les symptômes persistent."
            shouldConsultVet -> "Certains symptômes nécessitent une attention vétérinaire. Ce diagnostic est indicatif et seul un vétérinaire peut confirmer."
            else -> "Diagnostic basé sur les symptômes fournis. Surveillez l'évolution et consultez si aggravation."
        }
    }

    fun getAvailableRaces(): List<String> {
        return vetDiseaseRepository.findAll()
            .flatMap { it.affectedRaces }
            .distinct()
            .sorted()
    }

    fun getAvailableSymptoms(): List<String> {
        return vetDiseaseRepository.findAll()
            .flatMap { it.symptoms }
            .distinct()
            .sorted()
    }
}
