package com.veg.bio.authentification

import com.veg.bio.authentification.`in`.CreateUserDto
import com.veg.bio.authentification.`in`.LoginDto
import com.veg.bio.authentification.`in`.TokenDto
import com.veg.bio.authentification.out.LoginResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/authentification")
class AuthentificationController(
    private val authentificationService: AuthentificationService,
) {

    @PostMapping
    fun createUser(@RequestBody createUserDto: CreateUserDto): ResponseEntity<Map<String, String>> {
        val userId = authentificationService.createUserCustomer(createUserDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("id" to userId))
    }

    @PostMapping("/login")
    fun login(@RequestBody loginDto: LoginDto): ResponseEntity<LoginResponse> {
        val response = authentificationService.loginUser(loginDto)
        return ResponseEntity.status(HttpStatus.OK).body(response)
    }

    @PostMapping("/refreshToken")
    fun refreshToken(@RequestBody tokenDto: TokenDto): ResponseEntity<LoginResponse> {
        val response = authentificationService.refreshToken(tokenDto.refreshToken)
        return ResponseEntity.status(HttpStatus.OK).body(response)
    }

    @PostMapping("/logout")
    fun logout(@RequestBody tokenDto: TokenDto): ResponseEntity<Map<String, String>> {
        authentificationService.logout(tokenDto.refreshToken)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf("result" to "success"))
    }
}
