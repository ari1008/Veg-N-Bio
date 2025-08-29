package com.veg.bio.user.response

import java.util.UUID

data class UserSummaryResponse(
    val id: UUID,
    val username: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val fullName: String = "$firstName $lastName"
)
