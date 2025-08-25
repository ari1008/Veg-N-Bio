package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.DishEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface DishRepository : JpaRepository<DishEntity, UUID> {
    fun findByName(nameDish: String): DishEntity?
    override fun findById(id: UUID): Optional<DishEntity>
}