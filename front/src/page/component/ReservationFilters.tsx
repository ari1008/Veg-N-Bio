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
    // Fonction pour gérer les changements de filtres de manière sécurisée
    const handleFilterChange = (key: string, value: string) => {
        setFilters({
            ...filters,
            [key]: value || (key.includes('Date') ? '' : undefined)
        });
    };

    // Fonction pour valider une date avant affichage
    const formatDateForDisplay = (dateString: string): string => {
        if (!dateString || dateString.trim() === '') {
            return '';
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }
            return dateString;
        } catch (error) {
            console.error('Erreur de formatage de date:', error);
            return '';
        }
    };

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
                            onChange={(e) => handleFilterChange('status', e.target.value)}
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
                            onChange={(e) => handleFilterChange('type', e.target.value)}
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
                            value={formatDateForDisplay(filters.startDate)}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date fin</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={formatDateForDisplay(filters.endDate)}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            min={filters.startDate || undefined} // Empêche de sélectionner une date antérieure
                        />
                    </div>
                </div>

                <div className="card-actions justify-end">
                    <button
                        className="btn btn-ghost"
                        onClick={() => setFilters({
                            status: undefined,
                            type: undefined,
                            startDate: '',
                            endDate: ''
                        })}
                    >
                        Réinitialiser
                    </button>
                </div>

                {/* Indicateur des filtres actifs */}
                {(filters.status || filters.type || filters.startDate || filters.endDate) && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                            {filters.status && (
                                <div className="badge badge-primary badge-outline">
                                    Statut: {filters.status}
                                </div>
                            )}
                            {filters.type && (
                                <div className="badge badge-secondary badge-outline">
                                    Type: {filters.type === 'RESTAURANT_FULL' ? 'Restaurant' : 'Salle'}
                                </div>
                            )}
                            {filters.startDate && (
                                <div className="badge badge-accent badge-outline">
                                    Depuis: {formatDateForDisplay(filters.startDate)}
                                </div>
                            )}
                            {filters.endDate && (
                                <div className="badge badge-accent badge-outline">
                                    Jusqu'au: {formatDateForDisplay(filters.endDate)}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};