import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import {
    useRestaurantReservations,
    useUpdateReservationStatus,
    useCancelReservation
} from '../api/reservation/hook/hook.ts';

export const ManageReservationPage: React.FC = () => {
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const { data: restaurantReservations, isLoading } = useRestaurantReservations(selectedRestaurant);
    const updateStatusMutation = useUpdateReservationStatus();
    const cancelMutation = useCancelReservation();

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
                        <select
                            className="select select-bordered w-full max-w-md"
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                        >
                            <option value="">Choisir un restaurant</option>
                            {/* Remplacez par vos vraies données */}
                            <option value="restaurant-1">Restaurant Exemple 1</option>
                            <option value="restaurant-2">Restaurant Exemple 2</option>
                        </select>
                    </div>
                </div>

                {/* Table des réservations */}
                {selectedRestaurant && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Réservations du restaurant</h2>

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
                                                <td>{reservation.customerName}</td>
                                                <td>{new Date(reservation.startTime).toLocaleDateString('fr-FR')}</td>
                                                <td>
                                                    {new Date(reservation.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                                                    {new Date(reservation.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td>{reservation.numberOfPeople}</td>
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
                                                        Annuler
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