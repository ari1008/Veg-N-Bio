package com.veg.bio.infrastructure.table

import com.veg.bio.menu.domain.Allergen
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UuidGenerator
import java.time.LocalDateTime
import java.util.*

enum class OrderStatus { PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELED }

@Entity
@Table(name = "orders")
data class OrderEntity(

    @Id @GeneratedValue @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    val status: OrderStatus = OrderStatus.PENDING,


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    val customer: UserEntity,

    @Column(name = "total_amount", nullable = false)
    val totalAmount: Double = 0.0,

    @OneToMany(
        mappedBy = "order",
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        fetch = FetchType.EAGER
    )
    val lines: MutableList<OrderLineEntity> = mutableListOf(),


    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    val restaurant: RestaurantEntity,

    @Column(name = "flat_delivered", nullable = false)
    val flatDelivered: Boolean = false,


    ) {
    override fun toString(): String {
        return "OrderEntity(id=$id, status=$status, totalAmount=$totalAmount, customerName=${customer.email})"
    }
}

@Entity
@Table(
    name = "order_line",
    indexes = [Index(name = "idx_orderline_order_id", columnList = "order_id")]
)
data class OrderLineEntity(

    @Id @GeneratedValue @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    val order: OrderEntity,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dish_id", nullable = false)
    val dish: DishEntity,

    @Column(name = "dish_name_snapshot", length = 200, nullable = false)
    val dishNameSnapshot: String,

    @Column(name = "unit_price_snapshot", nullable = false)
    val unitPriceSnapshot: Double,

    @ElementCollection(targetClass = Allergen::class, fetch = FetchType.EAGER)
    @CollectionTable(name = "order_line_allergen", joinColumns = [JoinColumn(name = "order_line_id")])
    @Enumerated(EnumType.STRING)
    @Column(name = "allergen", length = 32, nullable = false)
    val allergensSnapshot: Set<Allergen> = emptySet(),

    @Column(name = "quantity", nullable = false)
    val quantity: Int
) {
    @Transient
    fun lineTotal(): Double = unitPriceSnapshot * quantity

    override fun toString(): String {
        return "OrderLineEntity(id=$id, dishName=$dishNameSnapshot, quantity=$quantity, unitPrice=$unitPriceSnapshot)"
    }

}
