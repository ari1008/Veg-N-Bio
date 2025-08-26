import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import type {OrderFilters} from "../../api/menu/dto/dto.ts";
import {useGetAllOrders, useOrderById, useUpdateOrderStatus} from "../../api/menu/hook/hook.ts";

interface OrderFiltersForm {
    status: string;
    dateFilter: string;
}

const OrdersDashboard: React.FC = () => {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // React Hook Form pour les filtres
    const { register, watch, reset: resetForm } = useForm<OrderFiltersForm>({
        defaultValues: {
            status: '',
            dateFilter: '',
        }
    });

    const watchedFilters = watch();

    // Construire les filtres pour la query
    const queryFilters: OrderFilters = {
        status: watchedFilters.status || undefined,
        startDate: watchedFilters.dateFilter ? new Date(watchedFilters.dateFilter).toISOString() : undefined,
        endDate: watchedFilters.dateFilter ? new Date(new Date(watchedFilters.dateFilter).setHours(23, 59, 59)).toISOString() : undefined,
        page: currentPage,
        size: 20,
        sortBy: 'createdAt',
        sortDirection: 'desc'
    };

    // Queries
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

    // Mutation pour mettre à jour le statut
    const updateStatusMutation = useUpdateOrderStatus();

    // Handlers
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

    // Fonction pour obtenir la couleur du statut
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

    // Fonction pour obtenir les actions possibles selon le statut
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
                <div className="text-sm text-base-content/70">
                    {orders && `${orders.totalElements} commande(s) au total`}
                </div>
            </div>

            {/* Statistiques rapides */}
            {orders && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="stat bg-base-100 rounded-lg shadow">
                        <div className="stat-title">En attente</div>
                        <div className="stat-value text-warning">
                            {orders.content.filter(o => o.status === 'PENDING').length}
                        </div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow">
                        <div className="stat-title">En préparation</div>
                        <div className="stat-value text-primary">
                            {orders.content.filter(o => o.status === 'PREPARING').length}
                        </div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow">
                        <div className="stat-title">Prêtes</div>
                        <div className="stat-value text-success">
                            {orders.content.filter(o => o.status === 'READY').length}
                        </div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow">
                        <div className="stat-title">CA affiché</div>
                        <div className="stat-value text-accent">
                            {orders.content.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}€
                        </div>
                    </div>
                </div>
            )}

            {/* Filtres avec React Hook Form */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <form className="flex flex-wrap gap-4 items-center">
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
                            <label className="label opacity-0">Actions</label>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleResetFilters}
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Liste des commandes */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : orders?.content.length === 0 ? (
                <div className="text-center py-10">
                    <div className="text-base-content/50 text-lg">Aucune commande trouvée</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders?.content.map((order) => (
                        <div key={order.id} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="card-title text-lg">#{order.id.slice(-6)}</div>
                                        <div className="text-sm text-base-content/70">{order.customerName}</div>
                                    </div>
                                    <div className={`badge ${getStatusBadgeClass(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <div className="font-semibold text-lg">{order.totalAmount.toFixed(2)}€</div>
                                        <div className="text-xs text-base-content/50">
                                            {new Date(order.createdAt).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-actions justify-between mt-4">
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => handleOrderDetail(order.id)}
                                    >
                                        Détails
                                    </button>

                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-sm btn-primary">
                                            Actions ▼
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                            {getAvailableActions(order.status).map((action) => (
                                                <li key={action}>
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, action)}
                                                        disabled={updateStatusMutation.isPending}
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
                    <div className="modal-box w-11/12 max-w-3xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Commande #{selectedOrder.id?.slice(-6) || 'N/A'}</h3>
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
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <strong>Client:</strong> {selectedOrder.customerName}
                                    </div>
                                    <div>
                                        <strong>Statut:</strong>
                                        <span className={`badge ml-2 ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                                    </div>
                                    <div>
                                        <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}
                                    </div>
                                    <div>
                                        <strong>Total:</strong> {selectedOrder.totalAmount.toFixed(2)}€
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Articles commandés:</h4>
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
                                                    <td>{line.dishName}</td>
                                                    <td>{line.unitPrice.toFixed(2)}€</td>
                                                    <td>{line.quantity}</td>
                                                    <td className="font-semibold">{line.lineTotal.toFixed(2)}€</td>
                                                    <td>
                                                        {line.allergens.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {line.allergens.map((allergen) => (
                                                                    <span key={allergen} className="badge badge-outline badge-xs">
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

                                <div className="modal-action">
                                    <div className="dropdown dropdown-top dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-primary">
                                            Changer le statut ▲
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                            {getAvailableActions(selectedOrder.status).map((action) => (
                                                <li key={action}>
                                                    <button
                                                        onClick={() => selectedOrder.id && handleStatusUpdate(selectedOrder.id, action)}
                                                        disabled={updateStatusMutation.isPending}
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
                                        className="btn"
                                        onClick={handleCloseModal}
                                    >
                                        Fermer
                                    </button>
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