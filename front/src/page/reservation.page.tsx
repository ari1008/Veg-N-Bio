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

const ReservationPage: React.FC = () => {
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [filters, setFilters] = useState({
        status: undefined as undefined | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
        type: undefined as undefined | 'RESTAURANT_FULL' | 'MEETING_ROOM',
        startDate: '',
        endDate: ''
    });

    const { reservations, isLoading, totalCount } = useReservationManager(filters);

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
                        <a href="/create-reservation" className="btn btn-primary">
                            + Nouvelle Réservation
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