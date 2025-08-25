package com.veg.bio.menu

import com.veg.bio.infrastructure.repository.DishRepository
import com.veg.bio.infrastructure.repository.InvoiceRepository
import com.veg.bio.infrastructure.repository.OrderRepository
import com.veg.bio.infrastructure.repository.RestaurantRepository
import com.veg.bio.infrastructure.repository.UserRepository
import com.veg.bio.infrastructure.table.DishEntity
import com.veg.bio.infrastructure.table.InvoiceEntity
import com.veg.bio.infrastructure.table.OrderEntity
import com.veg.bio.infrastructure.table.OrderStatus
import com.veg.bio.keycloak.Role
import com.veg.bio.menu.domain.Dish
import com.veg.bio.menu.domain.DishWithTotal
import com.veg.bio.menu.dto.DishNumber
import com.veg.bio.menu.dto.DishPatchDto
import com.veg.bio.menu.dto.Order
import com.veg.bio.menu.dto.StatusDto
import com.veg.bio.menu.mapper.OrderLineMapper
import com.veg.bio.menu.mapper.toSummaryDto
import com.veg.bio.menu.response.OrderListResponse
import com.veg.bio.menu.response.OrderResponse
import com.veg.bio.restaurant.RestaurantNotFound
import com.veg.bio.user.NotFoundUserWithClientId
import com.veg.bio.user.NotGoodTypeOfUser
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*


@Service
class MenuService(
    private val dishRepository: DishRepository,
    private val userRepository: UserRepository,
    private val restaurantRepository: RestaurantRepository,
    private val orderRepository: OrderRepository,
    private val invoiceRepository: InvoiceRepository,
) {

    fun createDish(dish: Dish) {
        val test = dishRepository.findByName(dish.name.value)
        if (test != null) throw ErrorDishExist()
        val dishEntity = DishEntity.fromDomain(dish)
        dishRepository.save(dishEntity)

    }


    fun makeAvailableOrNot(available: Boolean, idDish: UUID): Dish {
        val dishEntity = dishRepository.findById(idDish)
            .orElseThrow { ErrorDishDidntExist() }
        val dishUpdated = dishEntity.copy(available = available)
        dishRepository.save(dishUpdated)
        return dishUpdated.toDomain()
    }


    fun listAllDish(): List<DishEntity> {
        return dishRepository.findAll().stream().toList()
    }


    fun updateDish(patch: DishPatchDto, idDish: UUID): DishEntity {
        val cur = dishRepository.findById(idDish)
            .orElseThrow { ErrorDishDidntExist() }
        val current = cur.toDomain()
        val patched = cur.copy(
            id = idDish,
            name = patch.name?.value ?: current.name.value,
            description = patch.description?.value ?: current.description.value,
            price = patch.price ?: current.price,
            category = patch.category ?: current.category,
            available = patch.available ?: current.available,
            allergens = patch.allergens ?: current.allergens
        )
        return dishRepository.save(patched)
    }

    fun findOneDish(id: UUID): DishEntity {
        return dishRepository.findById(id)
            .orElseThrow { ErrorDishDidntExist() }
    }

    fun makeOrder(order: Order) {
        val user = userRepository.findById(order.idUser).orElseThrow { NotFoundUserWithClientId() }
        val restaurantEntity = restaurantRepository.findById(order.idRestaurant).orElseThrow { RestaurantNotFound() }
        val dishTotal = findDishes(order.listDishNumber)

        if (user.role == Role.RESTAURANT_OWNER) throw NotGoodTypeOfUser()

        val notAvailable = dishTotal.stream().filter { !it.dish.available }.toList()
        if (notAvailable.isNotEmpty()) throw ErrorDishNotAvailable()

        val totalAmount = dishTotal.sumOf { it.dish.price * it.total }
        val orderEntity = OrderLineMapper.createOrderEntity(user, totalAmount, restaurantEntity)
        dishTotal.forEach { OrderLineMapper.createOrderLineEntity(orderEntity, it) }

        orderRepository.save(orderEntity)
    }

    fun findDishes(listDish: List<DishNumber>): List<DishWithTotal> {
        val totals = listDish
            .groupBy { it.idDish }
            .mapValues { entry -> entry.value.sumOf { it.number } }

        return totals.mapNotNull { (id, total) ->
            dishRepository.findById(id).orElseThrow { ErrorDishDidntExist() }?.let { dish ->
                DishWithTotal(dish, total)
            }
        }
    }


    fun findOrder(idOrder: UUID): OrderResponse{
        val orderEntity = orderRepository.findById(idOrder).orElseThrow { ErrorNotFoundOrder() }
        return OrderLineMapper.toResponse(orderEntity)
    }

    fun changeTheStatus(idOrder: UUID,statusDto: StatusDto ): OrderResponse{
        val orderEntity = orderRepository.findById(idOrder).orElseThrow { ErrorNotFoundOrder() }

        if (orderEntity.status== OrderStatus.COMPLETED) throw ErrorInvoiceAlreadyCreate()
        val updateOrder = orderEntity.copy(
            status = statusDto.status
        )
        if (statusDto.status == OrderStatus.COMPLETED) createInvoice(orderEntity.totalAmount, orderEntity)
        orderRepository.save(updateOrder)
        return OrderLineMapper.toResponse(updateOrder)
    }

    fun createInvoice(totalAmount: Double, orderEntity: OrderEntity){
        invoiceRepository.save(InvoiceEntity(
            order = orderEntity,
            totalAmount = totalAmount
        ))
    }




    fun getOrders(
        status: OrderStatus? = null,
        customerId: UUID? = null,
        startDate: LocalDateTime? = null,
        endDate: LocalDateTime? = null,
        page: Int = 0,
        size: Int = 20,
        sortBy: String = "createdAt",
        sortDirection: String = "desc"
    ): OrderListResponse{
        require(page >= 0) { "Page must be >= 0" }
        require(size in 1..100) { "Size must be between 1 and 100" }
        require(sortBy in allowedSortFields) { "Invalid sort field: $sortBy" }
        require(sortDirection in listOf("asc", "desc")) { "Sort direction must be 'asc' or 'desc'" }

        val direction = if (sortDirection == "asc") Sort.Direction.ASC else Sort.Direction.DESC
        val sort = Sort.by(direction, sortBy)

        val pageable = PageRequest.of(page, size, sort)

        val ordersPage = orderRepository.findOrdersWithFilters(
            status, customerId, startDate, endDate, pageable
        )
        return OrderListResponse(
            content = ordersPage.content.map { it.toSummaryDto() },
            page = ordersPage.number,
            size = ordersPage.size,
            totalElements = ordersPage.totalElements,
            totalPages = ordersPage.totalPages,
            first = ordersPage.isFirst,
            last = ordersPage.isLast,
            hasNext = ordersPage.hasNext(),
            hasPrevious = ordersPage.hasPrevious()
        )
    }

    private val allowedSortFields = setOf(
        "createdAt", "updatedAt", "totalAmount", "status", "customer.name"
    )

}