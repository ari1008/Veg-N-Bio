package com.veg.bio.configuration

import org.keycloak.OAuth2Constants
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.springframework.context.annotation.Bean
import org.springframework.stereotype.Component

@Component
class KeycloakComponent(
    private val  keycloakConfiguration: KeycloakConfiguration,
) {


    @Bean
    fun createClientKeycloak(): Keycloak = KeycloakBuilder.builder()
        .serverUrl(keycloakConfiguration.serverUrl)
        .realm(keycloakConfiguration.realmAdmin)
        .username(keycloakConfiguration.username)
        .password(keycloakConfiguration.password)
        .clientId(keycloakConfiguration.clientIdAdmin)
        .grantType(OAuth2Constants.PASSWORD)
        .build()


}