package com.veg.bio.configuration

import com.veg.bio.infrastructure.repository.VetDiseaseRepository
import com.veg.bio.infrastructure.table.UrgencyLevel
import com.veg.bio.infrastructure.table.VetDiseaseEntity
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class ChatbotDataInitializer(
    private val vetDiseaseRepository: VetDiseaseRepository
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        if (vetDiseaseRepository.count() == 0L) {
            initializeVeterinaryData()
        }
    }

    private fun initializeVeterinaryData() {
        val diseases = listOf(
            VetDiseaseEntity(
                name = "Rhume/Rhinite",
                description = "Infection respiratoire bénigne commune chez les animaux",
                symptoms = listOf("eternuements", "nez qui coule", "toux legere", "ecoulement nasal", "respiration difficile"),
                affectedRaces = listOf("toutes"),
                urgency = UrgencyLevel.LOW,
                advice = "Repos au chaud, surveiller 2-3 jours. Consulter si aggravation.",
                prevention = "Éviter les courants d'air, vaccination à jour"
            ),

            VetDiseaseEntity(
                name = "Gastro-entérite",
                description = "Inflammation du système digestif",
                symptoms = listOf("vomissements", "diarrhee", "perte appetit", "lethargie", "deshydratation", "douleur abdominale"),
                affectedRaces = listOf("toutes"),
                urgency = UrgencyLevel.MEDIUM,
                advice = "Diète hydrique 12-24h, puis alimentation légère. Consulter si persistance.",
                prevention = "Éviter changements alimentaires brusques, vermifugation régulière"
            ),

            VetDiseaseEntity(
                name = "Infection urinaire/Cystite",
                description = "Infection de la vessie nécessitant traitement",
                symptoms = listOf("urine frequente", "sang urine", "douleur miction", "leche genitaux", "urine forte odeur"),
                affectedRaces = listOf("toutes"),
                urgency = UrgencyLevel.HIGH,
                advice = "Consulter rapidement un vétérinaire pour traitement antibiotique.",
                prevention = "Beaucoup d'eau fraîche, hygiène, vidange vessie régulière"
            ),

            VetDiseaseEntity(
                name = "Dysplasie de la hanche",
                description = "Malformation articulaire fréquente chez les grandes races",
                symptoms = listOf("boiterie", "difficulte lever", "raideur", "douleur mouvement", "reluctance exercice"),
                affectedRaces = listOf("berger allemand", "labrador", "golden retriever", "rottweiler", "saint bernard"),
                urgency = UrgencyLevel.MEDIUM,
                advice = "Problème fréquent chez les grandes races. Consulter pour radiographie et suivi.",
                prevention = "Éviter surexercice chez les chiots, alimentation équilibrée, contrôle du poids"
            ),

            VetDiseaseEntity(
                name = "Conjonctivite",
                description = "Inflammation de la membrane de l'œil",
                symptoms = listOf("yeux rouges", "ecoulement oculaire", "clignements", "yeux gonflies", "photophobie"),
                affectedRaces = listOf("toutes"),
                urgency = UrgencyLevel.LOW,
                advice = "Nettoyer délicatement avec sérum physiologique. Consulter si persistance 48h.",
                prevention = "Éviter irritants, hygiène des yeux"
            )
        )

        vetDiseaseRepository.saveAll(diseases)
        println("✅ Données vétérinaires initialisées avec succès !")
    }
}