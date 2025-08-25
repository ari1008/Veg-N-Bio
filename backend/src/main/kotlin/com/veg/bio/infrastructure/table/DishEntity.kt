package com.veg.bio.infrastructure.table

import com.veg.bio.menu.domain.*
import jakarta.persistence.*
import org.hibernate.annotations.UuidGenerator
import java.util.*

@Entity
@Table(name = "dish")
data class DishEntity(

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID? = null,

    @Column(name = "name", nullable = false, length = 200)
    val name: String,

    @Column(name = "description", columnDefinition = "text")
    val description: String? = null,

    @Column(name = "price", nullable = false)
    val price: Double,

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 32)
    val category: Category,

    @Column(name = "available", nullable = false)
    val available: Boolean = true,

    @ElementCollection(targetClass = Allergen::class, fetch = FetchType.EAGER)
    @CollectionTable(name = "dish_allergen", joinColumns = [JoinColumn(name = "dish_id")])
    @Enumerated(EnumType.STRING)
    @Column(name = "allergen", length = 32, nullable = false)
    val allergens: Set<Allergen> = emptySet(),

    ) {
    fun toDomain() = Dish(
        name = NameDish(name),
        description = Description(description ?: ""),
        price = price,
        category = category,
        available = available,
        allergens = allergens
    )

    companion object {
        fun fromDomain(d: Dish) = DishEntity(
            name = d.name.value,
            description = d.description.value,
            price = d.price,
            category = d.category,
            available = d.available,
            allergens = d.allergens
        )
    }
}
