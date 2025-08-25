package com.veg.bio.menu

import com.veg.bio.infrastructure.table.DishEntity
import com.veg.bio.infrastructure.table.OrderEntity
import com.veg.bio.infrastructure.table.OrderStatus
import com.veg.bio.keycloak.ROLE_RESTAURANT_OWNER
import com.veg.bio.menu.domain.Dish
import com.veg.bio.menu.dto.AvailableDto
import com.veg.bio.menu.dto.DishPatchDto
import com.veg.bio.menu.dto.Order
import com.veg.bio.menu.dto.StatusDto
import com.veg.bio.menu.response.OrderListResponse
import com.veg.bio.menu.response.OrderResponse
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime
import java.util.UUID


@RestController
@RequestMapping("/api/menu")
class MenuController(
    private val menuService: MenuService,
) {

    @PostMapping
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun createDish(@RequestBody dish: Dish){
        menuService.createDish(dish)

    }

    @PostMapping("/available")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun makeAvailableOrNot(@RequestBody availableDto: AvailableDto): ResponseEntity<Dish>{
        val dish = menuService.makeAvailableOrNot(availableDto.available, availableDto.id)
        return ResponseEntity.ok().body(dish)
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun updateDish(
        @PathVariable("id")  id: UUID,
        @RequestBody dishPatchDto: DishPatchDto,
    ): ResponseEntity<DishEntity>{
        val dish = menuService.updateDish(dishPatchDto, id)
        return ResponseEntity.ok().body(dish)
    }


    @PostMapping("/order")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun createOrder(@RequestBody order: Order){
        menuService.makeOrder(order)
    }


    @GetMapping("/order/{id}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getOneOrder(
        @PathVariable("id")  idOrder: UUID,
    ): ResponseEntity<OrderResponse>{
        val orderResponse = menuService.findOrder(idOrder)
        return ResponseEntity.ok().body(orderResponse)
    }


    @PutMapping("/order/status/{id}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun modifyOrder(
        @PathVariable("id")  idOrder: UUID,
        @RequestBody statusDto: StatusDto,
    ): ResponseEntity<OrderResponse>{
        val orderResponse = menuService.changeTheStatus(idOrder, statusDto)
        return ResponseEntity.ok().body(orderResponse)
    }


    @GetMapping("/order")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getOrders(
        @RequestParam(required = false) status: OrderStatus?,
        @RequestParam(required = false) customerId: UUID?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: LocalDateTime?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: LocalDateTime?,
        @RequestParam(defaultValue = "0") @Min(0) page: Int,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) size: Int,
        @RequestParam(defaultValue = "createdAt") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDirection: String
        ): ResponseEntity<OrderListResponse> {
        val order = menuService.getOrders(status, customerId, startDate, endDate, page, size, sortBy, sortDirection)
        return ResponseEntity.ok().body(order)
    }

}