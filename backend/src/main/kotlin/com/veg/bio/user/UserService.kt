package com.veg.bio.user

import com.veg.bio.infrastructure.repository.UserRepository
import com.veg.bio.keycloak.Role
import com.veg.bio.user.mapper.MapperUserResponse
import com.veg.bio.user.response.UserResponse
import com.veg.bio.user.response.UserSummaryResponse
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
) {

    fun userMe(clientId: String): UserResponse{
        val userEntity = userRepository.findByClientId(clientId) ?: throw NotFoundUserWithClientId()
        return MapperUserResponse.mapToResponse(userEntity)
    }

    fun getAllCustomers(): List<UserSummaryResponse> {
        return userRepository.findByRole(Role.CUSTOMER).map { user ->
            UserSummaryResponse(
                id = user.id!!,
                username = user.username.value,
                firstName = user.firstName.value,
                lastName = user.lastName.value,
                email = user.email.value,
                fullName = "${user.firstName} ${user.lastName}"
            )
        }
    }

    fun searchCustomers(name: String?, email: String?, limit: Int): List<UserSummaryResponse> {
        val searchTerm = name ?: email ?: ""
        val customers = if (searchTerm.isBlank()) {
            userRepository.findByRole(Role.CUSTOMER)
        } else {
            userRepository.searchCustomers(Role.CUSTOMER, searchTerm).take(limit)
        }

        return customers.map { user ->
            UserSummaryResponse(
                id = user.id!!,
                username = user.username.value,
                firstName = user.firstName.value,
                lastName = user.lastName.value,
                email = user.email.value,
                fullName = "${user.firstName} ${user.lastName}"
            )
        }
    }
}