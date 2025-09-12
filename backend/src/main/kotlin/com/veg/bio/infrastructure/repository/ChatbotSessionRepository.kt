package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.ChatbotSessionEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface ChatbotSessionRepository : JpaRepository<ChatbotSessionEntity, UUID>