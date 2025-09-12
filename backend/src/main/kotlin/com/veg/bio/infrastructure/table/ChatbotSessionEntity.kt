package com.veg.bio.infrastructure.table

import jakarta.persistence.*
import java.util.*

@Entity
@Table(name = "chatbot_sessions")
data class ChatbotSessionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    val race: String,

    @ElementCollection
    @CollectionTable(name = "session_symptoms", joinColumns = [JoinColumn(name = "session_id")])
    @Column(name = "symptom")
    val symptoms: List<String>,

    @Column(columnDefinition = "TEXT")
    val diagnosisResult: String,

    @Column(name = "created_at", nullable = false)
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)
