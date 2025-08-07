package com.veg.bio.infrastructure.table

import com.veg.bio.restaurant.domain.NumberMettingPlace
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.util.UUID


@Entity
@Table(
    name = "meeting_room",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["restaurant_id", "name"])
    ]
)
data class MeetingRomEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    val name: String,

    @Column(name = "number_of_metting_place", nullable = false)
    val numberMettingPlace: NumberMettingPlace,

    @Column(name = "is_reservable", nullable = false)
    val isReservable: Boolean
)