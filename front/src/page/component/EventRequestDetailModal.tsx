import React from 'react';
import { toast } from 'react-hot-toast';
import {formatEventDateTime, getEventStatusLabel, getEventTypeLabel} from "../../api/event/utils.ts";
import {useCancelEventRequest, useUpdateEventRequestStatus} from "../../api/event/hook/hook.ts";
import type {EventRequest} from "../../api/event/dto/dto.ts";

interface EventRequestDetailModalProps {
    eventRequest: EventRequest;
    onClose: () => void;
}

export const EventRequestDetailModal: React.FC<EventRequestDetailModalProps> = ({ eventRequest, onClose }) => {
    const updateStatusMutation = useUpdateEventRequestStatus();
    const cancelMutation = useCancelEventRequest();

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await updateStatusMutation.mutateAsync({
                eventRequestId: eventRequest.id,
                payload: { status: newStatus }
            });
            toast.success('Statut mis à jour avec succès');
            onClose();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    const handleCancel = async () => {
        if (confirm('Êtes-vous sûr de vouloir annuler cette demande d\'événement ?')) {
            try {
                await cancelMutation.mutateAsync(eventRequest.id);
                toast.success('Demande annulée avec succès');
                onClose();
            } catch (error) {
                toast.error('Erreur lors de l\'annulation');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const statusStyles = {
            PENDING: 'badge-warning',
            CONFIRMED: 'badge-success',
            CANCELLED: 'badge-error',
            COMPLETED: 'badge-info'
        };
        return `badge ${statusStyles[status as keyof typeof statusStyles] || 'badge-neutral'}`;
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Détails de la demande d'événement</h3>

                <div className="space-y-4">
                    {/* En-tête */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-xl font-semibold">{eventRequest.title}</h4>
                            <div className="flex gap-2 mt-2">
                                <div className={getStatusBadge(eventRequest.status)}>
                                    {getEventStatusLabel(eventRequest.status)}
                                </div>
                                <div className="badge badge-outline">
                                    {getEventTypeLabel(eventRequest.type)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations principales */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <strong>Client:</strong> {eventRequest.customerName}
                        </div>
                        <div>
                            <strong>Restaurant:</strong> {eventRequest.restaurantName}
                        </div>
                        <div>
                            <strong>Date et heure:</strong><br />
                            {formatEventDateTime(eventRequest.startTime)}
                        </div>
                        <div>
                            <strong>Fin:</strong><br />
                            {formatEventDateTime(eventRequest.endTime)}
                        </div>
                        <div>
                            <strong>Participants:</strong> {eventRequest.numberOfPeople}
                        </div>
                        {eventRequest.estimatedPrice && (
                            <div>
                                <strong>Prix estimé:</strong> {eventRequest.estimatedPrice}€
                            </div>
                        )}
                    </div>

                    {/* Salle */}
                    {eventRequest.meetingRoomName && (
                        <div>
                            <strong>Salle:</strong> {eventRequest.meetingRoomName}
                        </div>
                    )}

                    {/* Contact */}
                    {eventRequest.contactPhone && (
                        <div>
                            <strong>Téléphone de contact:</strong> {eventRequest.contactPhone}
                        </div>
                    )}

                    {/* Description */}
                    {eventRequest.description && (
                        <div>
                            <strong>Description:</strong>
                            <p className="mt-1 text-base-content/80">{eventRequest.description}</p>
                        </div>
                    )}

                    {/* Demandes spéciales */}
                    {eventRequest.specialRequests && (
                        <div>
                            <strong>Demandes spéciales:</strong>
                            <p className="mt-1 text-base-content/80">{eventRequest.specialRequests}</p>
                        </div>
                    )}

                    {/* Date de création */}
                    <div className="text-sm text-base-content/60">
                        Créé le {new Date(eventRequest.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                </div>

                {/* Actions */}
                <div className="modal-action">
                    <div className="flex gap-2 w-full">
                        {eventRequest.status === 'PENDING' && (
                            <>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleStatusUpdate('CONFIRMED')}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    Confirmer
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={handleCancel}
                                    disabled={cancelMutation.isPending}
                                >
                                    Annuler
                                </button>
                            </>
                        )}

                        {eventRequest.status === 'CONFIRMED' && (
                            <button
                                className="btn btn-info"
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                disabled={updateStatusMutation.isPending}
                            >
                                Marquer comme terminé
                            </button>
                        )}

                        <button className="btn btn-ghost ml-auto" onClick={onClose}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};