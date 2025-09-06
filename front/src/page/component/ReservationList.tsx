import React from 'react';
import type {Reservation} from "../../api/reservation/dto/dto.ts";

interface ReservationListProps {
    reservations: Reservation[];
    isLoading: boolean;
    onSelectReservation: (reservation: Reservation) => void;
}

// Fonction utilitaire pour convertir un tableau de date en objet Date
const arrayToDate = (dateArray: number[] | string | Date): Date | null => {
    if (!dateArray) return null;

    // Si c'est déjà une chaîne ou un objet Date, l'utiliser directement
    if (typeof dateArray === 'string' || dateArray instanceof Date) {
        try {
            const date = new Date(dateArray);
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    }

    // Si c'est un tableau [année, mois, jour, heure, minute]
    if (Array.isArray(dateArray) && dateArray.length >= 3) {
        try {
            const [year, month, day, hour = 0, minute = 0] = dateArray;
            // Attention : les mois en JavaScript commencent à 0, donc on soustrait 1
            const date = new Date(year, month - 1, day, hour, minute);
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    }

    return null;
};

// Fonction utilitaire pour formater les dates de manière sécurisée
const formatDate = (dateValue: number[] | string | Date): string => {
    const date = arrayToDate(dateValue);
    if (!date) return 'Date invalide';

    try {
        return date.toLocaleDateString('fr-FR');
    } catch (error) {
        console.error('Erreur lors du formatage de date:', error, dateValue);
        return 'Date invalide';
    }
};

// Fonction utilitaire pour formater les heures de manière sécurisée
const formatTime = (dateValue: number[] | string | Date): string => {
    const date = arrayToDate(dateValue);
    if (!date) return '--:--';

    try {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        console.error('Erreur lors du formatage de l\'heure:', error, dateValue);
        return '--:--';
    }
};

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

    const getStatusText = (status: string) => {
        const statusTexts = {
            PENDING: 'En attente',
            CONFIRMED: 'Confirmée',
            CANCELLED: 'Annulée',
            COMPLETED: 'Terminée'
        };
        return statusTexts[status as keyof typeof statusTexts] || status;
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
                <p className="text-base-content/70 mb-4">Vous n'avez pas encore de réservation correspondant aux filtres.</p>

                {/* Données de test pour le développement */}
                <div className="mt-8 p-4 bg-base-200 rounded-lg">
                    <h4 className="font-semibold mb-2">Données de test :</h4>
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="card-title">Restaurant Test</h2>
                                <div className="badge badge-warning">En attente</div>
                                <div className="badge badge-primary">Restaurant</div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Date:</span>
                                    <br />
                                    {new Date().toLocaleDateString('fr-FR')}
                                </div>
                                <div>
                                    <span className="font-medium">Heure:</span>
                                    <br />
                                    12:00 - 14:00
                                </div>
                                <div>
                                    <span className="font-medium">Personnes:</span>
                                    <br />
                                    4
                                </div>
                                <div>
                                    <span className="font-medium">Prix:</span>
                                    <br />
                                    45€
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                                    <h2 className="card-title">{reservation.restaurantName || 'Restaurant'}</h2>
                                    <div className={getStatusBadge(reservation.status)}>
                                        {getStatusText(reservation.status)}
                                    </div>
                                    <div className={`badge ${getTypeBadge(reservation.type)}`}>
                                        {reservation.type === 'RESTAURANT_FULL' ? 'Restaurant' : 'Salle'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Date:</span>
                                        <br />
                                        {formatDate(reservation.startTime)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Heure:</span>
                                        <br />
                                        {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Personnes:</span>
                                        <br />
                                        {reservation.numberOfPeople || 'N/A'}
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