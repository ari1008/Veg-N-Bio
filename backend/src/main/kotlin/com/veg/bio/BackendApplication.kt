package com.veg.bio

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
@EntityScan(basePackages = ["com.veg.bio.infrastructure"])
class BackendApplication

fun main(args: Array<String>) {
    runApplication<BackendApplication>(*args)
}
