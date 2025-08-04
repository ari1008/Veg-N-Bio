package com.veg.bio.authentification.out

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long,
)