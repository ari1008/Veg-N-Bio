package com.veg.bio.user

import com.veg.bio.infrastructure.repository.UserRepository
import com.veg.bio.user.mapper.MapperUserResponse
import com.veg.bio.user.response.UserResponse
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
) {

    fun userMe(clientId: String): UserResponse{
        val userEntity = userRepository.findByClientId(clientId) ?: throw NotFoundUserWithClientId()
        return MapperUserResponse.mapToResponse(userEntity)
    }
}