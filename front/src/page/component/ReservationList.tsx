import React from 'react';
import type {Reservation} from "../../api/reservation/dto/dto.ts";

interface ReservationListProps {
    reservations: Reservation[];
    isLoading: boolean;
    onSelectReservation: (reservation: Reservation) => void;
}

export const ReservationList: React.FC<ReservationListProps> = ({
                                                                    reservations,
                                                                    isLoading,
                                                                    onSelectReservation
                                                                }) => {
    const getStatusBadge = (status: string) => {
        const statusStyles = {
            PENDING: 'badge-warning',
            CONFIRMED: 'badge-success',
            CANCELLED: 'badge-error',
            COMPLETED: 'badge-info'
        };
        return `badge ${statusStyles[status as keyof typeof statusStyles] || 'badge-neutral'}`;
    };

    const getTypeBadge = (type: string) => {
        return type === 'RESTAURANT_FULL' ? 'badge-primary' : 'badge-secondary';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">Aucune réservation</h3>
                <p className="text-base-content/70">Vous n'avez pas encore de réservation correspondant aux filtres.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {reservations.map((reservation) => (
                <div key={reservation.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="card-title">{reservation.restaurantName}</h2>
                                    <div className={getStatusBadge(reservation.status)}>
                                        {reservation.status}
                                    </div>
                                    <div className={`badge ${getTypeBadge(reservation.type)}`}>
                                        {reservation.type === 'RESTAURANT_FULL' ? 'Restaurant' : 'Salle'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Date:</span>
                                        <br />
                                        {new Date(reservation.startTime).toLocaleDateString('fr-FR')}
                                    </div>
                                    <div>
                                        <span className="font-medium">Heure:</span>
                                        <br />
                                        {new Date(reservation.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(reservation.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div>
                                        <span className="font-medium">Personnes:</span>
                                        <br />
                                        {reservation.numberOfPeople}
                                    </div>
                                    {reservation.totalPrice && (
                                        <div>
                                            <span className="font-medium">Prix:</span>
                                            <br />
                                            {reservation.totalPrice}€
                                        </div>
                                    )}
                                </div>

                                {reservation.meetingRoomName && (
                                    <div className="mt-2">
                                        <span className="font-medium">Salle: </span>
                                        {reservation.meetingRoomName}
                                    </div>
                                )}

                                {reservation.notes && (
                                    <div className="mt-2">
                                        <span className="font-medium">Notes: </span>
                                        <span className="text-base-content/70">{reservation.notes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => onSelectReservation(reservation)}
                                >
                                    Détails
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
