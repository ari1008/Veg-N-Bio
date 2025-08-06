package com.veg.bio.authentification.`in`

import com.veg.bio.keycloak.Role

data class LoginDto(
    val username: String,
    val password: String,
    val role: Role,
)
