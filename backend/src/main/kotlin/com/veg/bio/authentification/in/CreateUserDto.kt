package com.veg.bio.authentification.`in`

import com.veg.bio.authentification.domain.FirstName
import com.veg.bio.authentification.domain.LastName
import com.veg.bio.authentification.domain.Username
import com.veg.bio.authentification.domain.Email
import com.veg.bio.authentification.domain.Password
import com.veg.bio.keycloak.Role

data class CreateUserDto(
    val username: Username,
    val email: Email,
    val firstName: FirstName,
    val lastName: LastName,
    val password: Password,
    val role: Role,
)
