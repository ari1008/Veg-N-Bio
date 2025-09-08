import React from 'react';
import type {EventRequest} from "../../api/event/dto/dto.ts";
import {formatEventDate, formatEventTime, getEventStatusLabel, getEventTypeLabel} from "../../api/event/utils.ts";

interface EventRequestListProps {
    eventRequests: EventRequest[];
    isLoading: boolean;
    onSelectEventRequest: (eventRequest: EventRequest) => void;
}

export const EventRequestList: React.FC<EventRequestListProps> = ({
                                                                      eventRequests,
                                                                      isLoading,
                                                                      onSelectEventRequest
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
        const typeStyles = {
            ANNIVERSAIRE_ENFANT: 'badge-primary',
            CONFERENCE: 'badge-secondary',
            SEMINAIRE: 'badge-accent',
            REUNION_ENTREPRISE: 'badge-info',
            AUTRE: 'badge-neutral'
        };
        return typeStyles[type as keyof typeof typeStyles] || 'badge-neutral';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (eventRequests.length === 0) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-12">
                    <h2 className="text-xl font-semibold text-base-content/70">Aucune demande d'événement</h2>
                    <p className="text-base-content/50">Créez votre première demande d'événement</p>
                    <div className="card-actions justify-center mt-4">
                        <a href="/create-event-request" className="btn btn-primary">
                            Créer une demande
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {eventRequests.map((eventRequest) => (
                <div key={eventRequest.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="card-title">{eventRequest.title}</h2>
                                    <div className={getStatusBadge(eventRequest.status)}>
                                        {getEventStatusLabel(eventRequest.status)}
                                    </div>
                                    <div className={`badge ${getTypeBadge(eventRequest.type)}`}>
                                        {getEventTypeLabel(eventRequest.type)}
                                    </div>
                                </div>

                                <div className="text-sm text-base-content/70 mb-3">
                                    <strong>Client:</strong> {eventRequest.customerName} • <strong>Restaurant:</strong> {eventRequest.restaurantName}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Date:</span>
                                        <br />
                                        {formatEventDate(eventRequest.startTime)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Heure:</span>
                                        <br />
                                        {formatEventTime(eventRequest.startTime)} - {formatEventTime(eventRequest.endTime)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Participants:</span>
                                        <br />
                                        {eventRequest.numberOfPeople} personne{eventRequest.numberOfPeople > 1 ? 's' : ''}
                                    </div>
                                    {eventRequest.estimatedPrice && (
                                        <div>
                                            <span className="font-medium">Prix estimé:</span>
                                            <br />
                                            {eventRequest.estimatedPrice}€
                                        </div>
                                    )}
                                </div>

                                {eventRequest.meetingRoomName && (
                                    <div className="mt-2">
                                        <span className="font-medium">Salle: </span>
                                        {eventRequest.meetingRoomName}
                                    </div>
                                )}

                                {eventRequest.description && (
                                    <div className="mt-2">
                                        <span className="font-medium">Description: </span>
                                        <span className="text-base-content/70">{eventRequest.description}</span>
                                    </div>
                                )}

                                {eventRequest.contactPhone && (
                                    <div className="mt-2">
                                        <span className="font-medium">Contact: </span>
                                        <span className="text-base-content/70">{eventRequest.contactPhone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => onSelectEventRequest(eventRequest)}
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
