package com.veg.bio.user

import com.veg.bio.annotation.CurrentUserId
import com.veg.bio.user.response.UserResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService,
) {

    @GetMapping("/me")
    fun getUserConnected(@CurrentUserId sub: String): ResponseEntity<UserResponse> {
        val userResponse = userService.userMe(clientId = sub)
        return ResponseEntity.status(HttpStatus.OK).body(userResponse)
    }
}