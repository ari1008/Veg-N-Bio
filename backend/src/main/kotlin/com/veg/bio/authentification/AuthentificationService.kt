package com.veg.bio.authentification

import com.veg.bio.authentification.domain.Email
import com.veg.bio.authentification.domain.Username
import com.veg.bio.authentification.`in`.CreateUserDto
import com.veg.bio.authentification.`in`.LoginDto
import com.veg.bio.authentification.out.LoginResponse
import com.veg.bio.infrastructure.repository.UserRepository
import com.veg.bio.keycloak.KeycloakService
import org.springframework.stereotype.Service

@Service
class AuthentificationService(
    private val userRepository: UserRepository,
    private val keycloakService: KeycloakService
) {

    fun createUserCustomer(userDto: CreateUserDto): String {
        checkUserNotExists(userDto.username, userDto.email)

        val keycloakUserId = keycloakService.createUserWithRoleCustomer(userDto)

        val userEntity = MapperUserEntity.fromDto(userDto, keycloakUserId)
        userRepository.save(userEntity)

        return keycloakUserId
    }

    fun loginUser(loginDto: LoginDto): LoginResponse{
         return keycloakService.loginUser(loginDto.username, loginDto.password)
    }

    fun refreshToken(refreshToken: String): LoginResponse{
        return keycloakService.refreshToken(refreshToken)
    }

    fun logout(refreshToken: String){
        return keycloakService.logoutUser(refreshToken)
    }

    private fun checkUserNotExists(username: Username, email: Email) {
        if (userRepository.existsByUsernameOrEmail(username, email)) {
            throw UserExist()
        }
    }
}
