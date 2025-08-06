package com.veg.bio.infrastructure.table

import com.veg.bio.authentification.domain.Email
import com.veg.bio.authentification.domain.FirstName
import com.veg.bio.authentification.domain.LastName
import com.veg.bio.authentification.domain.Username
import com.veg.bio.keycloak.Role
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "users")
data class UserEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(unique = true)
    val username: Username,

    @Column(unique = true)
    val email: Email,

    val firstName: FirstName,

    val lastName: LastName,

    val clientId: String,

    val role: Role,
)