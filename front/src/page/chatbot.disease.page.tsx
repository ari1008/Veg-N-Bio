import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    useGetAllDiseases,
    useCreateDisease,
    useUpdateDisease,
    useDeleteDisease
} from '../api/chatbot/hook/hook';
import type { VetDisease, CreateDiseaseRequest, UpdateDiseaseRequest } from '../api/chatbot/dto/dto';
import ChatbotLayout from "./component/ChatbotLayout";

interface DiseasesFilters {
    urgency: '' | 'LOW' | 'MEDIUM' | 'HIGH';
    race: string;
    search: string;
}

const ChatbotDiseasesPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [filters, setFilters] = useState<DiseasesFilters>({
        urgency: '',
        race: '',
        search: ''
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDisease, setSelectedDisease] = useState<VetDisease | null>(null);

    const { data: diseasesData, isLoading, refetch } = useGetAllDiseases(currentPage, pageSize);
    const { mutate: createDisease, isPending: isCreating } = useCreateDisease();
    const { mutate: updateDisease, isPending: isUpdating } = useUpdateDisease();
    const { mutate: deleteDisease, isPending: isDeleting } = useDeleteDisease();

    useEffect(() => {
        if (searchParams.get('action') === 'create') {
            setIsCreateModalOpen(true);
        }
    }, [searchParams]);

    const handleCreateDisease = (data: CreateDiseaseRequest) => {
        createDisease(data, {
            onSuccess: () => {
                toast.success('Maladie créée avec succès !');
                setIsCreateModalOpen(false);
                refetch();
            },
            onError: (error: any) => {
                toast.error('Erreur lors de la création');
                console.error(error);
            }
        });
    };

    const handleUpdateDisease = (data: UpdateDiseaseRequest) => {
        if (!selectedDisease) return;

        updateDisease({ id: selectedDisease.id, data }, {
            onSuccess: () => {
                toast.success('Maladie modifiée avec succès !');
                setIsEditModalOpen(false);
                setSelectedDisease(null);
                refetch();
            },
            onError: (error: any) => {
                toast.error('Erreur lors de la modification');
                console.error(error);
            }
        });
    };

    const handleDeleteDisease = () => {
        if (!selectedDisease) return;

        deleteDisease(selectedDisease.id, {
            onSuccess: () => {
                toast.success('Maladie supprimée avec succès !');
                setIsDeleteModalOpen(false);
                setSelectedDisease(null);
                refetch();
            },
            onError: (error: any) => {
                toast.error('Erreur lors de la suppression');
                console.error(error);
            }
        });
    };

    const openEditModal = (disease: VetDisease) => {
        setSelectedDisease(disease);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (disease: VetDisease) => {
        setSelectedDisease(disease);
        setIsDeleteModalOpen(true);
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return 'badge-error';
            case 'MEDIUM': return 'badge-warning';
            case 'LOW': return 'badge-success';
            default: return 'badge-ghost';
        }
    };

    const getUrgencyLabel = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return 'Élevée';
            case 'MEDIUM': return 'Modérée';
            case 'LOW': return 'Faible';
            default: return urgency;
        }
    };


    const filteredDiseases = diseasesData?.content.filter(disease => {
        const matchesUrgency = !filters.urgency || disease.urgency === filters.urgency;
        const matchesRace = !filters.race || disease.affectedRaces.some(race =>
            race.toLowerCase().includes(filters.race.toLowerCase())
        );
        const matchesSearch = !filters.search ||
            disease.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            disease.symptoms.some(symptom =>
                symptom.toLowerCase().includes(filters.search.toLowerCase())
            );

        return matchesUrgency && matchesRace && matchesSearch;
    }) || [];

    return (
        <ChatbotLayout
            title="Gestion des Maladies"
            subtitle="Base de connaissances vétérinaires"
        >
            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-base-content">
                            {diseasesData?.totalElements || 0} maladie{(diseasesData?.totalElements || 0) > 1 ? 's' : ''}
                        </h2>
                        <button
                            onClick={() => refetch()}
                            className="btn btn-ghost btn-sm"
                            disabled={isLoading}
                        >
                            🔄 Actualiser
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn btn-primary"
                    >
                        <span className="mr-2">🦠</span>
                        Nouvelle maladie
                    </button>
                </div>

                {/* Filters */}
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Recherche</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nom ou symptôme..."
                                    className="input input-bordered w-full"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Urgence</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={filters.urgency}
                                    onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value as any }))}
                                >
                                    <option value="">Toutes</option>
                                    <option value="HIGH">Élevée</option>
                                    <option value="MEDIUM">Modérée</option>
                                    <option value="LOW">Faible</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Race</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Race spécifique..."
                                    className="input input-bordered w-full"
                                    value={filters.race}
                                    onChange={(e) => setFilters(prev => ({ ...prev, race: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diseases List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="card bg-base-100 shadow-sm border border-base-300">
                                    <div className="card-body animate-pulse">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2 flex-1">
                                                <div className="h-6 bg-base-300 rounded w-1/3"></div>
                                                <div className="h-4 bg-base-300 rounded w-2/3"></div>
                                                <div className="h-4 bg-base-300 rounded w-1/2"></div>
                                            </div>
                                            <div className="space-x-2">
                                                <div className="w-16 h-8 bg-base-300 rounded"></div>
                                                <div className="w-16 h-8 bg-base-300 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredDiseases.length === 0 ? (
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body text-center py-16">
                                <span className="text-6xl mb-4 block">🔍</span>
                                <h3 className="text-xl font-bold text-base-content mb-2">
                                    Aucune maladie trouvée
                                </h3>
                                <p className="text-base-content/60 mb-6">
                                    {filters.search || filters.urgency || filters.race
                                        ? "Essayez de modifier vos filtres de recherche"
                                        : "Commencez par créer votre première maladie"
                                    }
                                </p>
                                {!filters.search && !filters.urgency && !filters.race && (
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="btn btn-primary"
                                    >
                                        <span className="mr-2">🦠</span>
                                        Créer une maladie
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        filteredDiseases.map((disease) => (
                            <div key={disease.id} className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
                                <div className="card-body">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-base-content">
                                                    {disease.name}
                                                </h3>
                                                <div className={`badge ${getUrgencyColor(disease.urgency)}`}>
                                                    {getUrgencyLabel(disease.urgency)}
                                                </div>
                                            </div>

                                            <p className="text-sm text-base-content/70">
                                                {disease.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                <div className="text-xs">
                                                    <span className="font-medium text-base-content/70">Symptômes:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {disease.symptoms.slice(0, 4).map((symptom) => (
                                                            <span key={symptom} className="badge badge-outline badge-sm">
                                                                {symptom}
                                                            </span>
                                                        ))}
                                                        {disease.symptoms.length > 4 && (
                                                            <span className="badge badge-ghost badge-sm">
                                                                +{disease.symptoms.length - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-xs">
                                                <span className="font-medium text-base-content/70">Races affectées:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {disease.affectedRaces.includes('toutes') ? (
                                                        <span className="badge badge-info badge-sm">
                                                            Toutes races
                                                        </span>
                                                    ) : (
                                                        disease.affectedRaces.slice(0, 3).map((race) => (
                                                            <span key={race} className="badge badge-secondary badge-sm">
                                                                {race}
                                                            </span>
                                                        ))
                                                    )}
                                                    {disease.affectedRaces.length > 3 && !disease.affectedRaces.includes('toutes') && (
                                                        <span className="badge badge-ghost badge-sm">
                                                            +{disease.affectedRaces.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-2">
                                            <button
                                                onClick={() => openEditModal(disease)}
                                                className="btn btn-outline btn-sm"
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(disease)}
                                                className="btn btn-error btn-outline btn-sm"
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {diseasesData && diseasesData.totalPages > 1 && (
                    <div className="flex justify-center">
                        <div className="join">
                            <button
                                className="join-item btn"
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                            >
                                « Précédent
                            </button>

                            {Array.from({ length: Math.min(5, diseasesData.totalPages) }, (_, i) => {
                                const pageNum = Math.max(0, Math.min(
                                    diseasesData.totalPages - 5,
                                    currentPage - 2
                                )) + i;

                                return (
                                    <button
                                        key={pageNum}
                                        className={`join-item btn ${currentPage === pageNum ? 'btn-active' : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}

                            <button
                                className="join-item btn"
                                onClick={() => setCurrentPage(prev => Math.min(diseasesData.totalPages - 1, prev + 1))}
                                disabled={currentPage === diseasesData.totalPages - 1}
                            >
                                Suivant »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <DiseaseFormModal
                    title="Créer une nouvelle maladie"
                    onSubmit={handleCreateDisease}
                    onClose={() => setIsCreateModalOpen(false)}
                    isLoading={isCreating}
                />
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedDisease && (
                <DiseaseFormModal
                    title="Modifier la maladie"
                    disease={selectedDisease}
                    onSubmit={handleUpdateDisease}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedDisease(null);
                    }}
                    isLoading={isUpdating}
                />
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedDisease && (
                <DeleteConfirmModal
                    disease={selectedDisease}
                    onConfirm={handleDeleteDisease}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedDisease(null);
                    }}
                    isLoading={isDeleting}
                />
            )}
        </ChatbotLayout>
    );
};


interface DiseaseFormModalProps {
    title: string;
    disease?: VetDisease;
    onSubmit: (data: CreateDiseaseRequest | UpdateDiseaseRequest) => void;
    onClose: () => void;
    isLoading: boolean;
}

const DiseaseFormModal: React.FC<DiseaseFormModalProps> = ({
                                                               title,
                                                               disease,
                                                               onSubmit,
                                                               onClose,
                                                               isLoading
                                                           }) => {
    const [formData, setFormData] = useState({
        name: disease?.name || '',
        description: disease?.description || '',
        urgency: disease?.urgency || 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
        advice: disease?.advice || '',
        prevention: disease?.prevention || '',
        symptoms: disease?.symptoms.join(', ') || '',
        affectedRaces: disease?.affectedRaces.join(', ') || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            name: formData.name,
            description: formData.description,
            urgency: formData.urgency,
            advice: formData.advice,
            prevention: formData.prevention || undefined,
            symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s),
            affectedRaces: formData.affectedRaces.split(',').map(s => s.trim()).filter(s => s)
        };

        onSubmit(submitData);
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
                <h3 className="font-bold text-lg mb-4">{title}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-medium">Nom de la maladie *</span>
                            </label>
                            <input
                                type="text"
                                required
                                className="input input-bordered w-full"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">Urgence *</span>
                            </label>
                            <select
                                required
                                className="select select-bordered w-full"
                                value={formData.urgency}
                                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                            >
                                <option value="LOW">Faible</option>
                                <option value="MEDIUM">Modérée</option>
                                <option value="HIGH">Élevée</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Description *</span>
                        </label>
                        <textarea
                            required
                            className="textarea textarea-bordered w-full h-24"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Symptômes *</span>
                            <span className="label-text-alt">Séparez par des virgules</span>
                        </label>
                        <textarea
                            required
                            placeholder="vomissements, diarrhée, perte d'appétit..."
                            className="textarea textarea-bordered w-full h-20"
                            value={formData.symptoms}
                            onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Races affectées *</span>
                            <span className="label-text-alt">Séparez par des virgules ou "toutes"</span>
                        </label>
                        <textarea
                            required
                            placeholder="berger allemand, labrador, toutes..."
                            className="textarea textarea-bordered w-full h-20"
                            value={formData.affectedRaces}
                            onChange={(e) => setFormData(prev => ({ ...prev, affectedRaces: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Conseils de traitement *</span>
                        </label>
                        <textarea
                            required
                            className="textarea textarea-bordered w-full h-24"
                            value={formData.advice}
                            onChange={(e) => setFormData(prev => ({ ...prev, advice: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Prévention</span>
                            <span className="label-text-alt">Optionnel</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-20"
                            value={formData.prevention}
                            onChange={(e) => setFormData(prev => ({ ...prev, prevention: e.target.value }))}
                        />
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn"
                            disabled={isLoading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    {disease ? 'Modification...' : 'Création...'}
                                </>
                            ) : (
                                disease ? 'Modifier' : 'Créer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface DeleteConfirmModalProps {
    disease: VetDisease;
    onConfirm: () => void;
    onClose: () => void;
    isLoading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
                                                                   disease,
                                                                   onConfirm,
                                                                   onClose,
                                                                   isLoading
                                                               }) => {
    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg text-error mb-4">
                    Confirmer la suppression
                </h3>

                <div className="space-y-4">
                    <p className="text-base-content">
                        Êtes-vous sûr de vouloir supprimer définitivement la maladie suivante ?
                    </p>

                    <div className="bg-base-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-base-content mb-2">
                            {disease.name}
                        </h4>
                        <p className="text-sm text-base-content/70">
                            {disease.description}
                        </p>
                        <div className="mt-2">
                            <span className={`badge ${
                                disease.urgency === 'HIGH' ? 'badge-error' :
                                    disease.urgency === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                            }`}>
                                Urgence {disease.urgency === 'HIGH' ? 'élevée' :
                                disease.urgency === 'MEDIUM' ? 'modérée' : 'faible'}
                            </span>
                        </div>
                    </div>

                    <div className="alert alert-warning">
                        <span className="text-sm">
                            ⚠️ Cette action est irréversible. Tous les diagnostics liés à cette maladie
                            pourraient être affectés.
                        </span>
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        onClick={onClose}
                        className="btn"
                        disabled={isLoading}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn btn-error"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Suppression...
                            </>
                        ) : (
                            'Supprimer définitivement'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatbotDiseasesPage;