import React, { useState } from 'react';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import { isAuthenticated } from '../util/authentified.ts';
import type {EventRequest} from "../api/event/dto/dto.ts";
import {useEventRequestManager} from "../api/event/hook/hook.ts";
import { EventRequestFilters} from "./component/EventRequestFilters.tsx";
import {EventRequestList} from "./component/EventRequestList.tsx";
import {EventRequestDetailModal} from "./component/EventRequestDetailModal.tsx";

const EventRequestsPage: React.FC = () => {
    const [selectedEventRequest, setSelectedEventRequest] = useState<EventRequest | null>(null);
    const [filters, setFilters] = useState({
        status: undefined as undefined | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
        type: undefined as undefined | 'ANNIVERSAIRE_ENFANT' | 'CONFERENCE' | 'SEMINAIRE' | 'REUNION_ENTREPRISE' | 'AUTRE',
        startDate: '',
        endDate: ''
    });

    const { eventRequests, isLoading, totalCount } = useEventRequestManager(filters);

    const canManageEventRequests = isAuthenticated();

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100">
            <Navbar />

            <main className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Demandes d'Événements</h1>
                        <p className="text-base-content/70">
                            {totalCount} demande{totalCount > 1 ? 's' : ''} au total
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Bouton de gestion des demandes d'événements */}
                        {canManageEventRequests && (
                            <a href="/manage-event-requests" className="btn btn-secondary btn-outline">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Gérer les demandes
                            </a>
                        )}

                        {/* Bouton nouvelle demande d'événement */}
                        <a href="/create-event-request" className="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouvelle Demande
                        </a>
                    </div>
                </div>

                <EventRequestFilters
                    filters={filters}
                    setFilters={setFilters}
                />

                <EventRequestList
                    eventRequests={eventRequests}
                    isLoading={isLoading}
                    onSelectEventRequest={setSelectedEventRequest}
                />

                {selectedEventRequest && (
                    <EventRequestDetailModal
                        eventRequest={selectedEventRequest}
                        onClose={() => setSelectedEventRequest(null)}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
};

export default EventRequestsPage;
