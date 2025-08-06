package com.veg.bio.keycloak

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.veg.bio.authentification.ErrorLogin
import com.veg.bio.authentification.`in`.CreateUserDto
import com.veg.bio.authentification.out.LoginResponse
import com.veg.bio.configuration.KeycloakConfiguration
import org.keycloak.admin.client.Keycloak
import org.keycloak.representations.idm.CredentialRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class KeycloakService(
    private val keycloak: Keycloak,
    private val keycloakConfiguration: KeycloakConfiguration,
) {

    fun createUserWithRole(userDto: CreateUserDto): String {
        if (!createUser(userDto)) throw ErrorKeycloak()
        val clientId = getUserIdByUsername(userDto.username.value) ?: throw ErrorKeycloak()
        if (!affectRole(clientId, userDto.role)) throw ErrorKeycloak() else
            return clientId
    }

    fun loginUser(username: String, password: String): LoginResponse {
        val url =
            "${keycloakConfiguration.serverUrl}/realms/${keycloakConfiguration.realm}/protocol/openid-connect/token"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_FORM_URLENCODED
        }

        val body = "grant_type=password&client_id=${keycloakConfiguration.clientId}" +
                "&username=$username&password=$password"

        val entity = HttpEntity(body, headers)
        val restTemplate = RestTemplate()
        try {
            val response = restTemplate.postForEntity(url, entity, String::class.java)

            if (!response.statusCode.is2xxSuccessful) {
                throw ErrorLogin()
            }

            val json = jacksonObjectMapper().readTree(response.body)
            val accessToken = json["access_token"].asText()
            val refreshToken = json["refresh_token"].asText()
            val expiresIn = json["expires_in"].asLong()

            return LoginResponse(accessToken, refreshToken, expiresIn)
        } catch (_: Exception) {
            throw ErrorLogin()
        }
    }


    fun refreshToken(refreshToken: String): LoginResponse {
        val url =
            "${keycloakConfiguration.serverUrl}/realms/${keycloakConfiguration.realm}/protocol/openid-connect/token"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_FORM_URLENCODED
        }

        val body = "grant_type=refresh_token" +
                "&client_id=${keycloakConfiguration.clientId}" +
                "&refresh_token=$refreshToken"

        val entity = HttpEntity(body, headers)
        try {
            val response = RestTemplate().postForEntity(url, entity, String::class.java)

            if (!response.statusCode.is2xxSuccessful) {
                throw ErrorRefreshToken()
            }
            val json = jacksonObjectMapper().readTree(response.body!!)
            val newAccessToken = json["access_token"].asText()
            val newRefreshToken = json["refresh_token"].asText()
            val expiresIn = json["expires_in"].asLong()


            return LoginResponse(
                accessToken = newAccessToken,
                refreshToken = newRefreshToken,
                expiresIn = expiresIn,
            )
        } catch (_: Exception) {
            throw ErrorRefreshToken()
        }


    }

    fun logoutUser(refreshToken: String) {
        val url =
            "${keycloakConfiguration.serverUrl}/realms/${keycloakConfiguration.realm}/protocol/openid-connect/logout"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_FORM_URLENCODED
        }

        val body = "client_id=${keycloakConfiguration.clientId}" +
                "&refresh_token=$refreshToken"

        val entity = HttpEntity(body, headers)
        try {
            val response = RestTemplate().postForEntity(url, entity, String::class.java)

            if (!response.statusCode.is2xxSuccessful) {
                throw ErrorLogin()
            }
        } catch (_: Exception) {
            throw ErrorLogin()
        }

    }


    private fun createUser(userDto: CreateUserDto): Boolean {
        val user = UserRepresentation().apply {
            username = userDto.username.value
            email = userDto.email.value
            isEnabled = true
            firstName = userDto.firstName.value
            lastName = userDto.lastName.value
            credentials = listOf(
                CredentialRepresentation().apply {
                    type = CredentialRepresentation.PASSWORD
                    value = userDto.password.value
                    isTemporary = false
                }
            )
        }
        val response = keycloak.realm(keycloakConfiguration.realm).users().create(user)
        return response.status == SUCCESS
    }


    private fun getUserIdByUsername(username: String): String? {
        val users = keycloak.realm(keycloakConfiguration.realm).users().search(username)
        return users.firstOrNull()?.id
    }


    private fun affectRole(userId: String, role: Role): Boolean {
        val realm = keycloak.realm(keycloakConfiguration.realm)

        val role = realm.roles()
            .get(role.role)
            .toRepresentation()

        return try {
            realm.users()
                .get(userId)
                .roles()
                .realmLevel()
                .add(listOf(role))
            true
        } catch (ex: Exception) {
            false
        }
    }


    companion object {
        const val SUCCESS = 201
    }
}