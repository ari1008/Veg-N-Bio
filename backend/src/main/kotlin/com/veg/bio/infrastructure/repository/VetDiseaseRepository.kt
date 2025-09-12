package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.VetDiseaseEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.*

interface VetDiseaseRepository : JpaRepository<VetDiseaseEntity, UUID> {

    @Query("""
        SELECT d FROM VetDiseaseEntity d 
        WHERE d.affectedRaces IS EMPTY 
        OR 'toutes' MEMBER OF d.affectedRaces 
        OR LOWER(:race) MEMBER OF d.affectedRaces
    """)
    fun findDiseasesByRace(@Param("race") race: String): List<VetDiseaseEntity>
}