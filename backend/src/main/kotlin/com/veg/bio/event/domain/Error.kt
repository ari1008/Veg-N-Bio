package com.veg.bio.event.domain

class ValidationException(message: String) : RuntimeException(message)
class InsufficientCapacityException(message: String) : RuntimeException(message)