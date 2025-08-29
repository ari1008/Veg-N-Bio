package com.veg.bio.user

import com.veg.bio.annotation.CurrentUserId
import com.veg.bio.keycloak.ROLE_RESTAURANT_OWNER
import com.veg.bio.user.response.UserResponse
import com.veg.bio.user.response.UserSummaryResponse
import jakarta.validation.constraints.Max
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
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

    @GetMapping("/customers")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getAllCustomers(): ResponseEntity<List<UserSummaryResponse>> {
        val customers = userService.getAllCustomers()
        return ResponseEntity.status(HttpStatus.OK).body(customers)
    }

    @GetMapping("/customers/search")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun searchCustomers(
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) email: String?,
        @RequestParam(defaultValue = "10") @Max(50) limit: Int
    ): ResponseEntity<List<UserSummaryResponse>> {
        val customers = userService.searchCustomers(name, email, limit)
        return ResponseEntity.status(HttpStatus.OK).body(customers)
    }
}