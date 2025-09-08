import React from 'react';
import {EVENT_STATUS_LABELS, EVENT_TYPE_LABELS} from "../../api/event/utils.ts";

interface EventRequestFiltersProps {
    filters: {
        status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
        type?: 'ANNIVERSAIRE_ENFANT' | 'CONFERENCE' | 'SEMINAIRE' | 'REUNION_ENTREPRISE' | 'AUTRE';
        startDate: string;
        endDate: string;
    };
    setFilters: (filters: any) => void;
}

export const EventRequestFilters: React.FC<EventRequestFiltersProps> = ({ filters, setFilters }) => {
    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: undefined,
            type: undefined,
            startDate: '',
            endDate: ''
        });
    };

    const hasActiveFilters = filters.status || filters.type || filters.startDate || filters.endDate;

    return (
        <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">Filtres</h2>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="btn btn-ghost btn-sm"
                        >
                            Effacer les filtres
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtre par statut */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Statut</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Tous les statuts</option>
                            {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre par type */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Type d'événement</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={filters.type || ''}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">Tous les types</option>
                            {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre par date de début */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date de début</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>

                    {/* Filtre par date de fin */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date de fin</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
