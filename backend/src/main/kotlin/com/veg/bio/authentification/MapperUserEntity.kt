package com.veg.bio.authentification

import com.veg.bio.authentification.`in`.CreateUserDto
import com.veg.bio.infrastructure.table.UserEntity

object MapperUserEntity {
    fun fromDto(createUserDto: CreateUserDto, clientId: String): UserEntity{
        return UserEntity(
            email = createUserDto.email,
            username = createUserDto.username,
            lastName = createUserDto.lastName,
            firstName = createUserDto.firstName,
            clientId = clientId
        )
    }
}