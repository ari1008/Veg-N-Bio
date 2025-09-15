package com.veg.bio.user.response

import com.veg.bio.authentification.domain.FirstName
import com.veg.bio.keycloak.Role

data class UserResponse(
    val id: String,
    val username: String,
    val lastName: String,
    val firstName: String,
    val email: String,
    val role: Role,
    val fidelity: Int,
)