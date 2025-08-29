import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import type {OrderFilters} from "../../api/menu/dto/dto.ts";
import {useGetAllOrders, useOrderById, useUpdateOrderStatus} from "../../api/menu/hook/hook.ts";
import {useQueryClient} from "@tanstack/react-query";

interface OrderFiltersForm {
    status: string;
    dateFilter: string;
}

const OrdersDashboard: React.FC = () => {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { register, watch, reset: resetForm } = useForm<OrderFiltersForm>({
        defaultValues: {
            status: '',
            dateFilter: '',
        }
    });

    const watchedFilters = watch();

    const queryFilters: OrderFilters = {
        status: watchedFilters.status || undefined,
        startDate: watchedFilters.dateFilter ? new Date(watchedFilters.dateFilter).toISOString() : undefined,
        endDate: watchedFilters.dateFilter ? new Date(new Date(watchedFilters.dateFilter).setHours(23, 59, 59)).toISOString() : undefined,
        page: currentPage,
        size: 20,
        sortBy: 'createdAt',
        sortDirection: 'desc'
    };

    const {
        data: orders,
        isLoading,
        isError,
        error
    } = useGetAllOrders(queryFilters);

    const {
        data: selectedOrder,
        isLoading: isLoadingDetail
    } = useOrderById(selectedOrderId || '');

    const updateStatusMutation = useUpdateOrderStatus();

    const handleOrderDetail = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    const handleStatusUpdate = (orderId: string, newStatus: string) => {
        updateStatusMutation.mutate(
            { orderId, status: newStatus },
            {
                onSuccess: () => {
                    toast.success('Statut mis à jour avec succès');
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
                    if (isDetailModalOpen) {
                        setIsDetailModalOpen(false);
                    }
                },
                onError: (error: Error) => {
                    toast.error(error.message || 'Erreur lors de la mise à jour');
                }
            }
        );
    };

    const handleResetFilters = () => {
        resetForm();
        setCurrentPage(0);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setSelectedOrderId(null);
    };

    const parseBackendDate = (dateArray: number[] | string): Date => {
        if (typeof dateArray === 'string') {
            return new Date(dateArray);
        }
        if (Array.isArray(dateArray) && dateArray.length >= 6) {
            const [year, month, day, hour, minute, second] = dateArray;
            return new Date(year, month - 1, day, hour, minute, second);
        }
        return new Date();
    };
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'PENDING': return 'badge-warning';
            case 'CONFIRMED': return 'badge-info';
            case 'PREPARING': return 'badge-primary';
            case 'READY': return 'badge-success';
            case 'COMPLETED': return 'badge-success';
            case 'CANCELED': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const getAvailableActions = (status: string) => {
        switch (status) {
            case 'PENDING': return ['CONFIRMED', 'CANCELED'];
            case 'CONFIRMED': return ['PREPARING', 'CANCELED'];
            case 'PREPARING': return ['READY'];
            case 'READY': return ['COMPLETED'];
            default: return [];
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PENDING': 'En attente',
            'CONFIRMED': 'Confirmée',
            'PREPARING': 'En préparation',
            'READY': 'Prête',
            'COMPLETED': 'Terminée',
            'CANCELED': 'Annulée'
        };
        return labels[status] || status;
    };

    if (isError) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="alert alert-error">
                    <span>Erreur: {(error as Error)?.message}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header avec boutons d'action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
                    <div className="text-sm text-base-content/70 mt-1">
                        {orders && `${orders.totalElements} commande(s) au total`}
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Bouton Nouvelle Commande */}
                    <a
                        href="/create-order"
                        className="btn btn-primary gap-2 shadow-lg"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nouvelle Commande
                    </a>

                    {/* Bouton Borne de Commande */}
                    <a
                        href="/kiosk-order"
                        className="btn btn-success gap-2 shadow-lg"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Borne de Commande
                    </a>
                </div>
            </div>

            {/* Call-to-action si aucune commande */}
            {orders && orders.totalElements === 0 && (
                <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="card-body text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="card-title justify-center text-2xl mb-2">Aucune commande pour le moment</h2>
                        <p className="text-base-content/70 mb-6">
                            Commencez par créer votre première commande avec notre borne intuitive !
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="/kiosk-order"
                                className="btn btn-primary btn-lg gap-2"
                            >
                                🖥️ Utiliser la Borne de Commande
                            </a>
                            <a
                                href="/create-order"
                                className="btn btn-outline btn-lg gap-2"
                            >
                                ➕ Créer une Commande Manuelle
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistiques rapides */}
            {orders && orders.totalElements > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="stat bg-base-100 rounded-lg shadow">
                        <div className="stat-title">En attente</div>
                        <div className="stat-value text-warning">
                            {orders.content.filter(o => o.status === 'PENDING').length}
                        </div>
                        <div className="stat-desc">Commandes à confirmer</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow">
                        <div className="stat-title">En préparation</div>
                        <div className="stat-value text-primary">
                            {orders.content.filter(o => o.status === 'PREPARING').length}
                        </div>
                        <div className="stat-desc">En cours de préparation</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow">
                        <div className="stat-title">Prêtes</div>
                        <div className="stat-value text-success">
                            {orders.content.filter(o => o.status === 'READY').length}
                        </div>
                        <div className="stat-desc">À servir</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow">
                        <div className="stat-title">CA affiché</div>
                        <div className="stat-value text-accent">
                            {orders.content.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}€
                        </div>
                        <div className="stat-desc">Chiffre d'affaires</div>
                    </div>
                </div>
            )}

            {/* Actions rapides */}
            {orders && orders.totalElements > 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <h3 className="card-title">Actions rapides</h3>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href="/kiosk-order"
                                    className="btn btn-success btn-sm gap-1"
                                >
                                    🖥️ Ouvrir la Borne
                                </a>
                                <a
                                    href="/create-order"
                                    className="btn btn-primary btn-sm gap-1"
                                >
                                    ➕ Créer Commande
                                </a>
                                <button
                                    className="btn btn-info btn-sm gap-1"
                                    onClick={() => window.location.reload()}
                                >
                                    🔄 Actualiser
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtres */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h3 className="card-title mb-4">🔍 Filtres</h3>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Statut</span>
                            </label>
                            <select
                                className="select select-bordered w-full max-w-xs"
                                {...register('status')}
                            >
                                <option value="">Tous les statuts</option>
                                <option value="PENDING">En attente</option>
                                <option value="CONFIRMED">Confirmée</option>
                                <option value="PREPARING">En préparation</option>
                                <option value="READY">Prête</option>
                                <option value="COMPLETED">Terminée</option>
                                <option value="CANCELED">Annulée</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                {...register('dateFilter')}
                            />
                        </div>

                        <div className="form-control">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleResetFilters}
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des commandes */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <span className="loading loading-spinner loading-lg mb-4"></span>
                    <p className="text-base-content/70">Chargement des commandes...</p>
                </div>
            ) : orders?.content.length === 0 ? (
                <div className="text-center py-10">
                    <div className="text-base-content/50 text-lg">Aucune commande trouvée avec ces filtres</div>
                    <button
                        className="btn btn-outline btn-sm mt-4"
                        onClick={handleResetFilters}
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders?.content.map((order) => (
                        <div key={order.id} className="card bg-base-100 shadow hover:shadow-lg transition-all duration-200 border border-base-200">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="card-title text-lg">#{order.id.slice(-6)}</div>
                                        <div className="text-sm text-base-content/70 font-medium">{order.customerName}</div>
                                    </div>
                                    <div className={`badge ${getStatusBadgeClass(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <div className="font-semibold text-lg text-primary">{order.totalAmount.toFixed(2)}€</div>
                                        <div className="text-xs text-base-content/50">
                                            {parseBackendDate(order.createdAt).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-actions justify-between mt-4">
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => handleOrderDetail(order.id)}
                                    >
                                        👁️ Détails
                                    </button>

                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-sm btn-primary">
                                            Actions ▼
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border">
                                            {getAvailableActions(order.status).map((action) => (
                                                <li key={action}>
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, action)}
                                                        disabled={updateStatusMutation.isPending}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {updateStatusMutation.isPending ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ) : null}
                                                        Marquer comme {getStatusLabel(action)}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {orders && orders.totalPages && orders.totalPages > 1 && (
                <div className="flex justify-center">
                    <div className="join">
                        <button
                            className="join-item btn"
                            disabled={orders.first}
                            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                        >
                            «
                        </button>

                        {Array.from({ length: Math.min(5, orders.totalPages) }, (_, i) => {
                            const pageNum = Math.max(0, Math.min(orders.totalPages - 5, currentPage - 2)) + i;
                            return (
                                <button
                                    key={pageNum}
                                    className={`join-item btn ${pageNum === currentPage ? 'btn-active' : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        })}

                        <button
                            className="join-item btn"
                            disabled={orders.last}
                            onClick={() => handlePageChange(Math.min(orders.totalPages - 1, currentPage + 1))}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de détail */}
            {isDetailModalOpen && selectedOrder && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-base-100 pb-4 border-b">
                            <div>
                                <h3 className="font-bold text-xl">Commande #{selectedOrder.id?.slice(-6) || 'N/A'}</h3>
                                <p className="text-sm text-base-content/70 mt-1">
                                    {parseBackendDate(selectedOrder.createdAt).toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <button
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={handleCloseModal}
                            >
                                ✕
                            </button>
                        </div>

                        {isLoadingDetail ? (
                            <div className="flex justify-center py-10">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <strong>👤 Client:</strong> {selectedOrder.customerName}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <strong>📅 Date:</strong> {parseBackendDate(selectedOrder.createdAt).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <strong>📊 Statut:</strong>
                                            <span className={`badge ml-2 ${getStatusBadgeClass(selectedOrder.status)}`}>
                                                {getStatusLabel(selectedOrder.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <strong>💰 Total:</strong>
                                            <span className="text-xl font-bold text-primary">{selectedOrder.totalAmount.toFixed(2)}€</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-4 text-lg">🍽️ Articles commandés:</h4>
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                            <tr>
                                                <th>Plat</th>
                                                <th>Prix unitaire</th>
                                                <th>Quantité</th>
                                                <th>Total</th>
                                                <th>Allergènes</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedOrder.lines.map((line) => (
                                                <tr key={line.id}>
                                                    <td className="font-medium">{line.dishName}</td>
                                                    <td>{line.unitPrice.toFixed(2)}€</td>
                                                    <td>
                                                        <span className="badge badge-neutral">{line.quantity}</span>
                                                    </td>
                                                    <td className="font-semibold text-primary">{line.lineTotal.toFixed(2)}€</td>
                                                    <td>
                                                        {line.allergens.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {line.allergens.map((allergen) => (
                                                                    <span key={allergen} className="badge badge-warning badge-xs">
                                                                        {allergen}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-base-content/50">Aucun</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="modal-action pt-4 border-t">
                                    <div className="flex flex-wrap gap-3 justify-between w-full">
                                        <div className="dropdown dropdown-top">
                                            <div tabIndex={0} role="button" className="btn btn-primary">
                                                🔄 Changer le statut ▲
                                            </div>
                                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow-lg border">
                                                {getAvailableActions(selectedOrder.status).map((action) => (
                                                    <li key={action}>
                                                        <button
                                                            onClick={() => selectedOrder.id && handleStatusUpdate(selectedOrder.id, action)}
                                                            disabled={updateStatusMutation.isPending}
                                                            className="flex items-center gap-2"
                                                        >
                                                            {updateStatusMutation.isPending ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : null}
                                                            Marquer comme {getStatusLabel(action)}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            className="btn btn-outline"
                                            onClick={handleCloseModal}
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersDashboard;