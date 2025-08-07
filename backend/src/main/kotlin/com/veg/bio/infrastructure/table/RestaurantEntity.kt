package com.veg.bio.infrastructure.table

import com.veg.bio.restaurant.domain.NameRestaurant
import com.veg.bio.restaurant.domain.NumberPlace
import com.veg.bio.restaurant.domain.RestaurantFeature
import jakarta.persistence.*
import java.util.*


@Entity
@Table(name = "restaurants")
data class RestaurantEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "name", nullable = false, unique = true)
    val nameRestaurant: NameRestaurant,

    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "restaurant_id")
    val openingHours: List<OpeningHourEntity> = emptyList(),

    @Column(name = "number_of_place", nullable = false)
    val numberOfPlace: NumberPlace,

    val addressEmbeddable: AddressEmbeddable,

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "restaurant_features", joinColumns = [JoinColumn(name = "restaurant_id")])
    @Enumerated(EnumType.STRING)
    @Column(name = "feature")
    val features: Set<RestaurantFeature> = emptySet(),

    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "restaurant_id")
    val meetingRoms: List<MeetingRomEntity>,

    )
