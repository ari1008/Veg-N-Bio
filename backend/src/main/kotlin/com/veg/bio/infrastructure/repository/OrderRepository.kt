package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.OrderEntity
import com.veg.bio.infrastructure.table.OrderStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime
import java.util.UUID

interface OrderRepository: JpaRepository<OrderEntity, UUID> {

    @Query("""
        SELECT o FROM OrderEntity o 
        JOIN FETCH o.customer c
        LEFT JOIN FETCH o.lines l
        LEFT JOIN FETCH l.dish d
        WHERE (:status IS NULL OR o.status = :status)
        AND (:customerId IS NULL OR c.id = :customerId)
        AND (CAST(:startDate AS timestamp) IS NULL OR o.createdAt >= :startDate)
        AND (CAST(:endDate AS timestamp) IS NULL OR o.createdAt <= :endDate)
    """)
    fun findOrdersWithFilters(
        @Param("status") status: OrderStatus?,
        @Param("customerId") customerId: UUID?,
        @Param("startDate") startDate: LocalDateTime?,
        @Param("endDate") endDate: LocalDateTime?,
        pageable: Pageable
    ): Page<OrderEntity>

}