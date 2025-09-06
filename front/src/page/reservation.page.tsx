import React, { useState } from 'react';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import type { Reservation } from '../api/reservation/dto/dto.ts';
import {
    useReservationManager,
} from '../api/reservation/hook/hook.ts';
import {ReservationFilters} from "./component/ReservationFilters.tsx";
import {ReservationList} from "./component/ReservationList.tsx";
import {ReservationDetailModal} from "./component/ReservationDetailModal.tsx";
import { isAuthenticated } from '../util/authentified.ts'; // Ajustez le chemin selon votre structure

const ReservationPage: React.FC = () => {
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [filters, setFilters] = useState({
        status: undefined as undefined | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
        type: undefined as undefined | 'RESTAURANT_FULL' | 'MEETING_ROOM',
        startDate: '',
        endDate: ''
    });

    const { reservations, isLoading, totalCount } = useReservationManager(filters);

    const canManageReservations = isAuthenticated(); // Vous pouvez ajouter une vérification de rôle plus spécifique ici

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100">
            <Navbar />

            <main className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Mes Réservations</h1>
                        <p className="text-base-content/70">
                            {totalCount} réservation{totalCount > 1 ? 's' : ''} au total
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Bouton de gestion des réservations (pour les propriétaires) */}
                        {canManageReservations && (
                            <a href="/manage-reservations" className="btn btn-secondary btn-outline">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Gérer les réservations
                            </a>
                        )}

                        {/* Bouton nouvelle réservation */}
                        <a href="/create-reservation" className="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouvelle Réservation
                        </a>
                    </div>
                </div>

                <ReservationFilters
                    filters={filters}
                    setFilters={setFilters}
                />

                <ReservationList
                    reservations={reservations}
                    isLoading={isLoading}
                    onSelectReservation={setSelectedReservation}
                />

                {selectedReservation && (
                    <ReservationDetailModal
                        reservation={selectedReservation}
                        onClose={() => setSelectedReservation(null)}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
};

export default ReservationPage;