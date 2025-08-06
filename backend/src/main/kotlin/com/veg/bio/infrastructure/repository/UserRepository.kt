package com.veg.bio.infrastructure.repository

import com.veg.bio.authentification.domain.Email
import com.veg.bio.authentification.domain.Username
import com.veg.bio.infrastructure.table.UserEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserRepository : JpaRepository<UserEntity, UUID> {
    fun existsByUsernameOrEmail(username: Username, email: Email): Boolean
    fun findByUsername(username: Username): UserEntity?
}