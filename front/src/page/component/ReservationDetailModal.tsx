import React from 'react';
import { toast } from 'react-hot-toast';
import {useCancelReservation} from "../../api/reservation/hook/hook.ts";
import type {Reservation} from "../../api/reservation/dto/dto.ts";

interface ReservationDetailModalProps {
    reservation: Reservation;
    onClose: () => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
                                                                                  reservation,
                                                                                  onClose
                                                                              }) => {
    const cancelMutation = useCancelReservation();

    const handleCancel = async () => {
        if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            try {
                await cancelMutation.mutateAsync(reservation.id);
                toast.success('Réservation annulée avec succès !');
                onClose();
            } catch (error) {
                toast.error('Erreur lors de l\'annulation');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'badge-success';
            case 'PENDING': return 'badge-warning';
            case 'CANCELLED': return 'badge-error';
            case 'COMPLETED': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'Confirmée';
            case 'PENDING': return 'En attente';
            case 'CANCELLED': return 'Annulée';
            case 'COMPLETED': return 'Terminée';
            default: return status;
        }
    };

    const getTypeText = (type: string) => {
        return type === 'RESTAURANT_FULL' ? 'Restaurant complet' : 'Salle de réunion';
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-2xl text-base-content">Détails de la réservation</h3>
                        <p className="text-sm text-base-content/70 mt-1">
                            Réservation #{reservation.id.slice(-8)}
                        </p>
                    </div>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={onClose}
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Colonne 1 */}
                    <div className="space-y-4">
                        <div className="bg-base-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-lg mb-3 text-primary">Restaurant</h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-base-content/80">Nom:</span>
                                    <p className="text-lg font-semibold">{reservation.restaurantName}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-base-content/80">Type de réservation:</span>
                                    <div className="mt-1">
                                        <div className={`badge ${reservation.type === 'RESTAURANT_FULL' ? 'badge-primary' : 'badge-secondary'} badge-lg`}>
                                            {getTypeText(reservation.type)}
                                        </div>
                                    </div>
                                </div>
                                {reservation.meetingRoomName && (
                                    <div>
                                        <span className="font-medium text-base-content/80">Salle de réunion:</span>
                                        <p className="font-semibold">{reservation.meetingRoomName}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-base-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-lg mb-3 text-primary">Client</h4>
                            <div>
                                <span className="font-medium text-base-content/80">Nom:</span>
                                <p className="text-lg font-semibold">{reservation.customerName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Colonne 2 */}
                    <div className="space-y-4">
                        <div className="bg-base-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-lg mb-3 text-primary">Date & Heure</h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-base-content/80">Date:</span>
                                    <p className="text-lg font-semibold">
                                        {new Date(reservation.startTime).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-base-content/80">Heure:</span>
                                    <p className="text-lg font-semibold">
                                        {new Date(reservation.startTime).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} - {new Date(reservation.endTime).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-base-content/80">Durée:</span>
                                    <p className="font-semibold">
                                        {Math.round((new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) / (1000 * 60))} minutes
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-base-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-lg mb-3 text-primary">Détails</h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-base-content/80">Nombre de personnes:</span>
                                    <p className="text-lg font-semibold">{reservation.numberOfPeople}</p>
                                </div>
                                {reservation.totalPrice && (
                                    <div>
                                        <span className="font-medium text-base-content/80">Prix total:</span>
                                        <p className="text-lg font-semibold text-success">{reservation.totalPrice}€</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statut */}
                <div className="bg-base-200 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">Statut de la réservation</h4>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`badge ${getStatusColor(reservation.status)} badge-lg`}>
                                {getStatusText(reservation.status)}
                            </div>
                            <span className="text-sm text-base-content/70">
                                Créée le {new Date(reservation.createdAt).toLocaleDateString('fr-FR')} à {new Date(reservation.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {reservation.notes && (
                    <div className="bg-base-200 p-4 rounded-lg mb-6">
                        <h4 className="font-semibold text-lg mb-3 text-primary">Notes</h4>
                        <p className="text-base-content/80 leading-relaxed">{reservation.notes}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="modal-action">
                    <div className="flex gap-3 w-full justify-end">
                        {reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED' && (
                            <button
                                className={`btn btn-error ${cancelMutation.isPending ? 'loading' : ''}`}
                                onClick={handleCancel}
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Annulation...
                                    </>
                                ) : (
                                    <>
                                        ❌ Annuler la réservation
                                    </>
                                )}
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={onClose}>
                            ✓ Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};