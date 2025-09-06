import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import { useGetAllRestaurant } from '../api/restaurant/hook/useRestaurant.ts';
import {
    useRestaurantReservations,
    useUpdateReservationStatus,
    useCancelReservation
} from '../api/reservation/hook/hook.ts';

const arrayToDate = (dateArray: number[] | string | Date): Date | null => {
    if (!dateArray) return null;

    if (typeof dateArray === 'string' || dateArray instanceof Date) {
        try {
            const date = new Date(dateArray);
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    }

    if (Array.isArray(dateArray) && dateArray.length >= 3) {
        try {
            const [year, month, day, hour = 0, minute = 0] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute);
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    }

    return null;
};

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

export const ManageReservationPage: React.FC = () => {
    const [selectedRestaurant, setSelectedRestaurant] = useState('');

    const { mutate: loadRestaurants, data: restaurants = [], isPending: loadingRestaurants } = useGetAllRestaurant();

    const { data: restaurantReservations, isLoading } = useRestaurantReservations(selectedRestaurant);
    const updateStatusMutation = useUpdateReservationStatus();
    const cancelMutation = useCancelReservation();

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    const handleStatusUpdate = async (reservationId: string, status: string) => {
        try {
            await updateStatusMutation.mutateAsync({
                reservationId,
                payload: { status: status as any }
            });
            toast.success('Statut mis à jour avec succès !');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleCancel = async (reservationId: string) => {
        if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            try {
                await cancelMutation.mutateAsync(reservationId);
                toast.success('Réservation annulée avec succès !');
            } catch (error) {
                toast.error('Erreur lors de l\'annulation');
            }
        }
    };

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100">
            <Navbar />

            <main className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-base-content">Gestion des Réservations</h1>
                    <a href="/reservations" className="btn btn-ghost">
                        Mes réservations
                    </a>
                </div>

                {/* Sélection du restaurant */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <h2 className="card-title">Sélectionner un restaurant</h2>

                        {loadingRestaurants ? (
                            <div className="flex items-center gap-2">
                                <span className="loading loading-spinner loading-sm"></span>
                                <span>Chargement des restaurants...</span>
                            </div>
                        ) : (
                            <select
                                className="select select-bordered w-full max-w-md"
                                value={selectedRestaurant}
                                onChange={(e) => setSelectedRestaurant(e.target.value)}
                            >
                                <option value="">Choisir un restaurant</option>
                                {restaurants.map((restaurant) => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name} - {restaurant.address.city}
                                    </option>
                                ))}
                            </select>
                        )}

                        {restaurants.length === 0 && !loadingRestaurants && (
                            <div className="text-base-content/70">
                                Aucun restaurant disponible.
                            </div>
                        )}
                    </div>
                </div>

                {/* Table des réservations */}
                {selectedRestaurant && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">
                                Réservations du restaurant
                                {restaurants.find(r => r.id === selectedRestaurant) && (
                                    <span className="text-sm font-normal text-base-content/70">
                                        - {restaurants.find(r => r.id === selectedRestaurant)?.name}
                                    </span>
                                )}
                            </h2>

                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : restaurantReservations && restaurantReservations.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra">
                                        <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th>Date</th>
                                            <th>Heure</th>
                                            <th>Personnes</th>
                                            <th>Type</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {restaurantReservations.map((reservation) => (
                                            <tr key={reservation.id}>
                                                <td>{reservation.customerName || 'N/A'}</td>
                                                <td>{formatDate(reservation.startTime)}</td>
                                                <td>
                                                    {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                                                </td>
                                                <td>{reservation.numberOfPeople || 'N/A'}</td>
                                                <td>
                                                    <div className={`badge ${reservation.type === 'RESTAURANT_FULL' ? 'badge-primary' : 'badge-secondary'}`}>
                                                        {reservation.type === 'RESTAURANT_FULL' ? 'Restaurant' : 'Salle'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <select
                                                        className="select select-xs select-bordered"
                                                        value={reservation.status}
                                                        onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        <option value="PENDING">En attente</option>
                                                        <option value="CONFIRMED">Confirmé</option>
                                                        <option value="COMPLETED">Terminé</option>
                                                        <option value="CANCELLED">Annulé</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-xs btn-error"
                                                        onClick={() => handleCancel(reservation.id)}
                                                        disabled={cancelMutation.isPending || reservation.status === 'CANCELLED'}
                                                    >
                                                        {cancelMutation.isPending ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ) : (
                                                            'Annuler'
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center py-8 text-base-content/70">
                                    Aucune réservation pour ce restaurant.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};