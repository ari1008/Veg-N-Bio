package com.veg.bio.configuration

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(value = "keycloak")
data class KeycloakConfiguration(
    val serverUrl: String?,
    val realm: String?,
    val realmAdmin: String?,
    val username: String?,
    val password: String?,
    val clientId: String?,
    val clientIdAdmin: String?,
)
