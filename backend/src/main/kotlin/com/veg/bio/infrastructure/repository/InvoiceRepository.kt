package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.InvoiceEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface InvoiceRepository : JpaRepository<InvoiceEntity, UUID> {
}