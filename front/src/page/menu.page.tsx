import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../api/auth/store/store';
import Navbar from "./component/navbar.tsx";
import {useDishById, useGetAllDishes} from "../api/menu/hook/hook.ts";
import type {Dish} from "../api/menu/dto/dto.ts";

// Composant Error Boundary simple
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.log('MenuPage Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-base-200">
                    <Navbar />
                    <div className="max-w-6xl mx-auto p-6">
                        <div className="alert alert-error">
                            <span>Une erreur s'est produite lors du chargement du menu. Veuillez rafraîchir la page.</span>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const MenuPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Auth store pour vérifier si l'utilisateur est connecté
    const authData = useAuthStore((state) => state.authData);

    // Query pour récupérer tous les plats
    const {
        data: dishes,
        isLoading,
        isError,
        error
    } = useGetAllDishes();

    // Query pour récupérer le détail d'un plat
    const {
        data: selectedDish,
        isLoading: isLoadingDetail
    } = useDishById(selectedDishId || '');

    // Protection contre les données nulles/undefined
    const safeDishes = dishes || [];

    // Filtrer les plats par catégorie et disponibilité
    const filteredDishes = safeDishes.filter(dish =>
        dish && dish.available &&
        (selectedCategory === '' || dish.category === selectedCategory)
    );

    // Grouper les plats par catégorie avec protection
    const groupedDishes = filteredDishes.reduce((acc, dish) => {
        if (dish && dish.category) {
            if (!acc[dish.category]) {
                acc[dish.category] = [];
            }
            acc[dish.category].push(dish);
        }
        return acc;
    }, {} as Record<string, Dish[]>);

    const handleDishDetail = (dishId: string) => {
        setSelectedDishId(dishId);
        setIsDetailModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setSelectedDishId(null);
    };

    // Fonction pour obtenir l'emoji de la catégorie
    const getCategoryEmoji = (category: string) => {
        switch (category) {
            case 'ENTREE': return '🥗';
            case 'PLAT': return '🍽️';
            case 'DESSERT': return '🍰';
            case 'BOISSON': return '🥤';
            default: return '🍴';
        }
    };

    // Fonction pour obtenir le nom français de la catégorie
    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'ENTREE': return 'Entrées';
            case 'PLAT': return 'Plats';
            case 'DESSERT': return 'Desserts';
            case 'BOISSON': return 'Boissons';
            default: return category;
        }
    };

    // Fonction pour obtenir le nom français de l'allergène
    const getAllergenLabel = (allergen: string) => {
        const allergenLabels: Record<string, string> = {
            'GLUTEN': 'Gluten',
            'CRUSTACEANS': 'Crustacés',
            'EGGS': 'Œufs',
            'FISH': 'Poisson',
            'PEANUTS': 'Arachides',
            'SOYBEANS': 'Soja',
            'MILK': 'Lait',
            'NUTS': 'Fruits à coque',
            'CELERY': 'Céleri',
            'MUSTARD': 'Moutarde',
            'SESAME_SEEDS': 'Graines de sésame',
            'SULPHITES': 'Sulfites',
            'LUPIN': 'Lupin',
            'MOLLUSCS': 'Mollusques'
        };
        return allergenLabels[allergen] || allergen;
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary">Notre Menu 🌿</h1>
                    <p className="text-lg text-base-content/70">
                        Découvrez nos plats végétariens et biologiques
                    </p>

                    {/* Bouton Créer un plat - visible seulement si connecté */}
                    {authData && (
                        <div className="pt-2">
                            <Link
                                to="/create-dish"
                                className="btn btn-primary btn-sm gap-2"
                            >
                                ➕ Créer un nouveau plat
                            </Link>
                        </div>
                    )}
                </div>

                {/* Filtres par catégorie */}
                <div className="flex flex-wrap justify-center gap-2">
                    <button
                        className={`btn btn-sm ${selectedCategory === '' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSelectedCategory('')}
                    >
                        🍴 Tous les plats
                    </button>
                    {['ENTREE', 'PLAT', 'DESSERT', 'BOISSON'].map((category) => (
                        <button
                            key={category}
                            className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {getCategoryEmoji(category)} {getCategoryLabel(category)}
                        </button>
                    ))}
                </div>

                {/* Messages d'erreur */}
                {isError && (
                    <div className="alert alert-error">
                        <span>Erreur: {(error as Error)?.message}</span>
                    </div>
                )}

                {/* Loading */}
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : filteredDishes?.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-base-content/50 text-lg">Aucun plat disponible</div>
                    </div>
                ) : (
                    /* Liste des plats groupés par catégorie */
                    <div className="space-y-8">
                        {groupedDishes && Object.entries(groupedDishes).map(([category, categoryDishes]) => (
                            <div key={category} className="space-y-4">
                                <h2 className="text-2xl font-bold text-center">
                                    {getCategoryEmoji(category)} {getCategoryLabel(category)}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoryDishes.map((dish) => (
                                        <div key={dish.id} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                                            <div className="card-body">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="card-title text-lg">{dish.name}</h3>
                                                    <div className="text-xl font-bold text-primary">{dish.price.toFixed(2)}€</div>
                                                </div>

                                                {dish.description && (
                                                    <p className="text-base-content/70 text-sm line-clamp-3">
                                                        {dish.description}
                                                    </p>
                                                )}

                                                {/* Allergènes */}
                                                {dish.allergens && dish.allergens.length > 0 && (
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-semibold text-warning">⚠️ Allergènes:</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {dish.allergens.map((allergen, index) => (
                                                                <span key={`${allergen}-${index}`} className="badge badge-warning badge-xs">
                                  {getAllergenLabel(allergen)}
                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="card-actions justify-end mt-4">
                                                    <button
                                                        className="btn btn-sm btn-outline btn-primary"
                                                        onClick={() => handleDishDetail(dish.id)}
                                                    >
                                                        Voir détails
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de détail */}
                {isDetailModalOpen && selectedDish && (
                    <div className="modal modal-open">
                        <div className="modal-box w-11/12 max-w-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-xl">{selectedDish.name}</h3>
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
                                    <div className="flex justify-between items-center">
                                        <div className="badge badge-primary badge-lg">
                                            {getCategoryEmoji(selectedDish.category)} {getCategoryLabel(selectedDish.category)}
                                        </div>
                                        <div className="text-2xl font-bold text-primary">
                                            {selectedDish.price.toFixed(2)}€
                                        </div>
                                    </div>

                                    {selectedDish.description && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Description:</h4>
                                            <p className="text-base-content/80">{selectedDish.description}</p>
                                        </div>
                                    )}

                                    {selectedDish.allergens && selectedDish.allergens.length > 0 ? (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-warning">⚠️ Allergènes:</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedDish.allergens.map((allergen, index) => (
                                                    <div key={`${allergen}-${index}`} className="flex items-center gap-2">
                                                        <span className="badge badge-warning badge-sm">!</span>
                                                        <span className="text-sm">{getAllergenLabel(allergen)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert alert-success">
                                            <span>✅ Aucun allergène connu</span>
                                        </div>
                                    )}

                                    <div className="modal-action">
                                        <button
                                            className="btn btn-primary"
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
        </div>
    );
};

const MenuPageWithErrorBoundary: React.FC = () => {
    return (
        <ErrorBoundary>
            <MenuPage />
        </ErrorBoundary>
    );
};

export default MenuPageWithErrorBoundary;