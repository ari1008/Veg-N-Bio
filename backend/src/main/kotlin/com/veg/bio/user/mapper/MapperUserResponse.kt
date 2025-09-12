package com.veg.bio.user.mapper

import com.veg.bio.infrastructure.table.UserEntity
import com.veg.bio.user.response.UserResponse
import java.util.Locale
import java.util.Locale.getDefault

object MapperUserResponse {


    fun mapToResponse(userEntity: UserEntity): UserResponse{
        return UserResponse(
            username = userEntity.username.value,
            firstName = userEntity.firstName.value.replaceFirstChar { if (it.isLowerCase()) it.titlecase(getDefault()) else it.toString() },
            lastName = userEntity.lastName.value.replaceFirstChar { if (it.isLowerCase()) it.titlecase(getDefault()) else it.toString() },
            email = userEntity.email.value,
            role = userEntity.role,
            fidelity = userEntity.fidelity
        )
    }
}