import React from 'react';

interface ReservationFiltersProps {
    filters: {
        status: undefined | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
        type: undefined | 'RESTAURANT_FULL' | 'MEETING_ROOM';
        startDate: string;
        endDate: string;
    };
    setFilters: (filters: any) => void;
}

export const ReservationFilters: React.FC<ReservationFiltersProps> = ({ filters, setFilters }) => {
    return (
        <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
                <h2 className="card-title">Filtres</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Statut</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={filters.status || ''}
                            onChange={(e) => setFilters({...filters, status: e.target.value || undefined as any})}
                        >
                            <option value="">Tous</option>
                            <option value="PENDING">En attente</option>
                            <option value="CONFIRMED">Confirmé</option>
                            <option value="CANCELLED">Annulé</option>
                            <option value="COMPLETED">Terminé</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Type</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={filters.type || ''}
                            onChange={(e) => setFilters({...filters, type: e.target.value || undefined as any})}
                        >
                            <option value="">Tous</option>
                            <option value="RESTAURANT_FULL">Restaurant complet</option>
                            <option value="MEETING_ROOM">Salle de réunion</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date début</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={filters.startDate}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date fin</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={filters.endDate}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        />
                    </div>
                </div>

                <div className="card-actions justify-end">
                    <button
                        className="btn btn-ghost"
                        onClick={() => setFilters({ status: undefined, type: undefined, startDate: '', endDate: '' })}
                    >
                        Réinitialiser
                    </button>
                </div>
            </div>
        </div>
    );
};