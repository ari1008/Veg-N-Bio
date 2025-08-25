package com.veg.bio.menu.response

import com.veg.bio.keycloak.Role
import java.util.UUID

data class CustomerDto(
    val id: UUID,
    val firstName: String,
    val email: String,
    val lastName: String,
    val role: Role
)
