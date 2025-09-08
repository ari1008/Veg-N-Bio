import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import { useGetAllRestaurant } from '../api/restaurant/hook/useRestaurant.ts';
import {formatEventDate, formatEventTime, getEventStatusLabel, getEventTypeLabel} from "../api/event/utils.ts";
import type {EventRequest} from "../api/event/dto/dto.ts";
import {
    useCancelEventRequest,
    useRestaurantEventRequests,
    useUpdateEventRequestStatus
} from "../api/event/hook/hook.ts";

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

const EventRequestDetailsModal: React.FC<{
    eventRequest: EventRequest;
    onClose: () => void;
    onStatusUpdate: (status: string) => void;
    onCancel: () => void;
    isUpdating: boolean;
}> = ({ eventRequest, onClose, onStatusUpdate, onCancel, isUpdating }) => {
    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <h3 className="font-bold text-lg mb-4">Détails de la demande d'événement</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Informations principales */}
                    <div className="space-y-3">
                        <div>
                            <strong>Titre:</strong> {eventRequest.title}
                        </div>
                        <div>
                            <strong>Type:</strong> {getEventTypeLabel(eventRequest.type)}
                        </div>
                        <div>
                            <strong>Client:</strong> {eventRequest.customerName}
                        </div>
                        <div>
                            <strong>Restaurant:</strong> {eventRequest.restaurantName}
                        </div>
                        <div>
                            <strong>Participants:</strong> {eventRequest.numberOfPeople}
                        </div>
                    </div>

                    {/* Détails temporels */}
                    <div className="space-y-3">
                        <div>
                            <strong>Date:</strong> {formatEventDate(eventRequest.startTime)}
                        </div>
                        <div>
                            <strong>Heure:</strong> {formatEventTime(eventRequest.startTime)} - {formatEventTime(eventRequest.endTime)}
                        </div>
                        {eventRequest.meetingRoomName && (
                            <div>
                                <strong>Salle:</strong> {eventRequest.meetingRoomName}
                            </div>
                        )}
                        {eventRequest.contactPhone && (
                            <div>
                                <strong>Contact:</strong> {eventRequest.contactPhone}
                            </div>
                        )}
                        {eventRequest.estimatedPrice && (
                            <div>
                                <strong>Prix estimé:</strong> {eventRequest.estimatedPrice}€
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                {eventRequest.description && (
                    <div className="mb-4">
                        <strong>Description:</strong>
                        <p className="mt-1 p-3 bg-base-200 rounded">{eventRequest.description}</p>
                    </div>
                )}

                {/* Demandes spéciales */}
                {eventRequest.specialRequests && (
                    <div className="mb-4">
                        <strong>Demandes spéciales:</strong>
                        <p className="mt-1 p-3 bg-base-200 rounded">{eventRequest.specialRequests}</p>
                    </div>
                )}

                {/* Statut et actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <strong>Statut actuel:</strong>
                        <span className={`badge ${
                            eventRequest.status === 'PENDING' ? 'badge-warning' :
                                eventRequest.status === 'CONFIRMED' ? 'badge-success' :
                                    eventRequest.status === 'CANCELLED' ? 'badge-error' :
                                        'badge-info'
                        }`}>
                            {getEventStatusLabel(eventRequest.status)}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {eventRequest.status === 'PENDING' && (
                            <>
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => onStatusUpdate('CONFIRMED')}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : 'Confirmer'}
                                </button>
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={onCancel}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : 'Refuser'}
                                </button>
                            </>
                        )}

                        {eventRequest.status === 'CONFIRMED' && (
                            <button
                                className="btn btn-info btn-sm"
                                onClick={() => onStatusUpdate('COMPLETED')}
                                disabled={isUpdating}
                            >
                                {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : 'Marquer terminé'}
                            </button>
                        )}

                        <button className="btn btn-ghost btn-sm" onClick={onClose}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};

export const ManageEventRequestsPage: React.FC = () => {
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [selectedEventRequest, setSelectedEventRequest] = useState<EventRequest | null>(null);
    const [statusFilter, setStatusFilter] = useState('');

    const { mutate: loadRestaurants, data: restaurants = [], isPending: loadingRestaurants } = useGetAllRestaurant();

    const { data: restaurantEventRequests, isLoading } = useRestaurantEventRequests(selectedRestaurant);
    const updateStatusMutation = useUpdateEventRequestStatus();
    const cancelMutation = useCancelEventRequest();

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    // Filtrer les demandes par statut si nécessaire
    const filteredEventRequests = restaurantEventRequests?.filter(eventRequest =>
        !statusFilter || eventRequest.status === statusFilter
    ) || [];

    const handleStatusUpdate = async (eventRequestId: string, status: string) => {
        try {
            await updateStatusMutation.mutateAsync({
                eventRequestId,
                payload: { status: status as any }
            });
            toast.success('Statut mis à jour avec succès !');
            setSelectedEventRequest(null); // Fermer le modal
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleCancel = async (eventRequestId: string) => {
        if (confirm('Êtes-vous sûr de vouloir refuser cette demande d\'événement ?')) {
            try {
                await cancelMutation.mutateAsync(eventRequestId);
                toast.success('Demande refusée avec succès !');
                setSelectedEventRequest(null); // Fermer le modal
            } catch (error) {
                toast.error('Erreur lors du refus');
            }
        }
    };

    const handleQuickStatusUpdate = async (eventRequestId: string, status: string) => {
        try {
            await updateStatusMutation.mutateAsync({
                eventRequestId,
                payload: { status: status as any }
            });
            toast.success('Statut mis à jour avec succès !');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleQuickCancel = async (eventRequestId: string) => {
        if (confirm('Êtes-vous sûr de vouloir refuser cette demande d\'événement ?')) {
            try {
                await cancelMutation.mutateAsync(eventRequestId);
                toast.success('Demande refusée avec succès !');
            } catch (error) {
                toast.error('Erreur lors du refus');
            }
        }
    };

    // Statistiques rapides
    const stats = {
        total: filteredEventRequests.length,
        pending: filteredEventRequests.filter(er => er.status === 'PENDING').length,
        confirmed: filteredEventRequests.filter(er => er.status === 'CONFIRMED').length,
        completed: filteredEventRequests.filter(er => er.status === 'COMPLETED').length,
        cancelled: filteredEventRequests.filter(er => er.status === 'CANCELLED').length,
    };

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100">
            <Navbar />

            <main className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Gestion des Demandes d'Événements</h1>
                        <p className="text-base-content/70">Administrez les demandes d'événements de vos restaurants</p>
                    </div>
                    <div className="flex gap-2">
                        <a href="/event-requests" className="btn btn-ghost">
                            ← Retour à la liste
                        </a>
                        <a href="/create-event-request" className="btn btn-primary">
                            Nouvelle demande
                        </a>
                    </div>
                </div>

                {/* Sélection du restaurant */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <h2 className="card-title">Sélection du restaurant</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Restaurant</span>
                                </label>
                                {loadingRestaurants ? (
                                    <div className="skeleton h-12 w-full"></div>
                                ) : (
                                    <select
                                        className="select select-bordered"
                                        value={selectedRestaurant}
                                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                                    >
                                        <option value="">Sélectionner un restaurant</option>
                                        {restaurants.map((restaurant) => (
                                            <option key={restaurant.id} value={restaurant.id}>
                                                {restaurant.name} - {restaurant.address.city}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Filtrer par statut</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="PENDING">En attente</option>
                                    <option value="CONFIRMED">Confirmé</option>
                                    <option value="COMPLETED">Terminé</option>
                                    <option value="CANCELLED">Annulé</option>
                                </select>
                            </div>
                        </div>

                        {/* Statistiques */}
                        {selectedRestaurant && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                <div className="stat bg-base-200 rounded-lg">
                                    <div className="stat-title">Total</div>
                                    <div className="stat-value text-lg">{stats.total}</div>
                                </div>
                                <div className="stat bg-yellow-100 rounded-lg">
                                    <div className="stat-title">En attente</div>
                                    <div className="stat-value text-lg text-yellow-600">{stats.pending}</div>
                                </div>
                                <div className="stat bg-green-100 rounded-lg">
                                    <div className="stat-title">Confirmé</div>
                                    <div className="stat-value text-lg text-green-600">{stats.confirmed}</div>
                                </div>
                                <div className="stat bg-blue-100 rounded-lg">
                                    <div className="stat-title">Terminé</div>
                                    <div className="stat-value text-lg text-blue-600">{stats.completed}</div>
                                </div>
                                <div className="stat bg-red-100 rounded-lg">
                                    <div className="stat-title">Annulé</div>
                                    <div className="stat-value text-lg text-red-600">{stats.cancelled}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table des demandes d'événements */}
                {selectedRestaurant && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">
                                Demandes d'événements du restaurant
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
                            ) : filteredEventRequests && filteredEventRequests.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra">
                                        <thead>
                                        <tr>
                                            <th>Titre</th>
                                            <th>Client</th>
                                            <th>Date</th>
                                            <th>Heure</th>
                                            <th>Participants</th>
                                            <th>Type</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredEventRequests.map((eventRequest) => (
                                            <tr key={eventRequest.id}>
                                                <td>
                                                    <div>
                                                        <div className="font-bold">{eventRequest.title}</div>
                                                        {eventRequest.meetingRoomName && (
                                                            <div className="text-sm opacity-70">
                                                                Salle: {eventRequest.meetingRoomName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="font-medium">{eventRequest.customerName}</div>
                                                        {eventRequest.contactPhone && (
                                                            <div className="text-sm opacity-70">
                                                                {eventRequest.contactPhone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{formatDate(eventRequest.startTime)}</td>
                                                <td>
                                                    {formatTime(eventRequest.startTime)} - {formatTime(eventRequest.endTime)}
                                                </td>
                                                <td>{eventRequest.numberOfPeople}</td>
                                                <td>
                                                    <div className="badge badge-outline">
                                                        {getEventTypeLabel(eventRequest.type)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <select
                                                        className="select select-xs select-bordered"
                                                        value={eventRequest.status}
                                                        onChange={(e) => handleQuickStatusUpdate(eventRequest.id, e.target.value)}
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        <option value="PENDING">En attente</option>
                                                        <option value="CONFIRMED">Confirmé</option>
                                                        <option value="COMPLETED">Terminé</option>
                                                        <option value="CANCELLED">Refusé</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button
                                                            className="btn btn-xs btn-info"
                                                            onClick={() => setSelectedEventRequest(eventRequest)}
                                                        >
                                                            Détails
                                                        </button>
                                                        <button
                                                            className="btn btn-xs btn-error"
                                                            onClick={() => handleQuickCancel(eventRequest.id)}
                                                            disabled={cancelMutation.isPending || eventRequest.status === 'CANCELLED'}
                                                        >
                                                            {cancelMutation.isPending ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                'Refuser'
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center py-8 text-base-content/70">
                                    {statusFilter
                                        ? `Aucune demande d'événement avec le statut "${statusFilter}" pour ce restaurant.`
                                        : "Aucune demande d'événement pour ce restaurant."
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal de détails */}
                {selectedEventRequest && (
                    <EventRequestDetailsModal
                        eventRequest={selectedEventRequest}
                        onClose={() => setSelectedEventRequest(null)}
                        onStatusUpdate={(status) => handleStatusUpdate(selectedEventRequest.id, status)}
                        onCancel={() => handleCancel(selectedEventRequest.id)}
                        isUpdating={updateStatusMutation.isPending || cancelMutation.isPending}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
};