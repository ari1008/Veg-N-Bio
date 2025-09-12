package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.ChatbotReportEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface ChatbotReportRepository : JpaRepository<ChatbotReportEntity, UUID>{
    fun existsBySessionId(sessionId: UUID): Boolean
    fun findBySessionId(sessionId: UUID): List<ChatbotReportEntity>
}
