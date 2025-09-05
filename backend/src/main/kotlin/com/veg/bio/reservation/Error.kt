package com.veg.bio.reservation

class ReservationNotFoundException(message: String = "Réservation non trouvée") : RuntimeException(message)
class CustomerNotFoundException(message: String = "Client non trouvé") : RuntimeException(message)
class RestaurantNotFoundException(message: String = "Restaurant non trouvé") : RuntimeException(message)
class MeetingRoomNotFoundException(message: String = "Salle de réunion non trouvée") : RuntimeException(message)
class UnauthorizedReservationAccessException(message: String = "Accès non autorisé à cette réservation") : RuntimeException(message)
class ReservationConflictException(message: String = "Conflit de réservation") : RuntimeException(message)
class InvalidReservationTimeException(message: String = "Créneau de réservation invalide") : RuntimeException(message)
class RestaurantClosedException(message: String = "Le restaurant est fermé à cette heure") : RuntimeException(message)
class InsufficientCapacityException(message: String = "Capacité insuffisante") : RuntimeException(message)
class InvalidReservationStateTransitionException(message: String = "Transition d'état invalide") : RuntimeException(message)