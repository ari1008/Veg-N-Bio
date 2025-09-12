package com.veg.bio.infrastructure.table

import jakarta.persistence.*
import java.util.*

@Entity
@Table(name = "chatbot_reports")
data class ChatbotReportEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "session_id", nullable = false)
    val sessionId: UUID,

    @Column(columnDefinition = "TEXT")
    val feedback: String,

    @Column(name = "actual_diagnosis")
    val actualDiagnosis: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)