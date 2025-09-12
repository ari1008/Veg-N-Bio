package com.veg.bio.infrastructure.table

import jakarta.persistence.*
import java.util.*
enum class UrgencyLevel {
    LOW, MEDIUM, HIGH
}

@Entity
@Table(name = "vet_diseases")
data class VetDiseaseEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    val name: String,

    @Column(columnDefinition = "TEXT")
    val description: String,

    @ElementCollection
    @CollectionTable(name = "disease_symptoms", joinColumns = [JoinColumn(name = "disease_id")])
    @Column(name = "symptom")
    val symptoms: List<String> = listOf(),

    @ElementCollection
    @CollectionTable(name = "disease_races", joinColumns = [JoinColumn(name = "disease_id")])
    @Column(name = "race")
    val affectedRaces: List<String> = listOf(),

    @Enumerated(EnumType.STRING)
    val urgency: UrgencyLevel,

    @Column(columnDefinition = "TEXT")
    val advice: String,

    @Column(columnDefinition = "TEXT")
    val prevention: String? = null
)
