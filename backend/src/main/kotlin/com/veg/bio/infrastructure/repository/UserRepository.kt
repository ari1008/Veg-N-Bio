package com.veg.bio.infrastructure.repository

import com.veg.bio.authentification.domain.Email
import com.veg.bio.authentification.domain.Username
import com.veg.bio.infrastructure.table.UserEntity
import com.veg.bio.keycloak.Role
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.*

interface UserRepository : JpaRepository<UserEntity, UUID> {
    fun existsByUsernameOrEmail(username: Username, email: Email): Boolean
    fun findByUsername(username: Username): UserEntity?
    fun findByClientId(clientId: String): UserEntity?

    fun findByRole(role: Role): List<UserEntity>

    @Query("SELECT u FROM UserEntity u WHERE u.role = :role AND " +
            "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    fun searchCustomers(
        @Param("role") role: Role,
        @Param("searchTerm") searchTerm: String
    ): List<UserEntity>


    fun findByRole(role: Role, pageable: Pageable): Page<UserEntity>
}