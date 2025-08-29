import React, { useState, useEffect } from 'react';
import { useGetAllRestaurant } from '../api/restaurant/hook/useRestaurant';
import { useGetAllDishes } from '../api/menu/hook/hook';
import { useCreateOrder } from '../api/menu/hook/hook';
import Navbar from './component/navbar';
import type { Dish } from '../api/menu/dto/dto';
import {useUserSearch} from "../api/auth/hook/hook.ts";
import type {UserSummary} from "../api/auth/dto/dto.ts";
import type {Restaurant} from "../api/restaurant/dto/restaurant.ts";

interface CartItem {
    dishId: string;
    dishName: string;
    unitPrice: number;
    quantity: number;
    category: string;
    allergens: string[];
}

type Step = 'restaurant' | 'menu' | 'cart' | 'customer' | 'confirmation';

const KioskOrderPage = () => {
    const [currentStep, setCurrentStep] = useState<Step>('restaurant');
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
    const [guestName, setGuestName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isDelivery, setIsDelivery] = useState(false); // État pour la livraison

    const { mutate: loadRestaurants, data: restaurants = [], isPending: loadingRestaurants } = useGetAllRestaurant();
    const { data: dishes = [], isLoading: loadingDishes } = useGetAllDishes();
    const { mutate: createOrder, isPending: creatingOrder } = useCreateOrder();

    const { users, isLoading: loadingUsers, searchTerm, setSearchTerm } = useUserSearch(20);

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    // Réinitialiser l'option de livraison quand on change de restaurant
    useEffect(() => {
        if (selectedRestaurant) {
            const hasDeliveryFeature = selectedRestaurant.restaurantFeatures.includes('PLATEAUX_LIVRABLE');
            if (!hasDeliveryFeature) {
                setIsDelivery(false);
            }
        }
    }, [selectedRestaurant]);

    const availableDishes = dishes.filter(dish => dish.available);

    const dishesByCategory = availableDishes.reduce((acc, dish) => {
        if (!acc[dish.category]) {
            acc[dish.category] = [];
        }
        acc[dish.category].push(dish);
        return acc;
    }, {} as Record<string, Dish[]>);

    const categories = Object.keys(dishesByCategory);

    const getCategoryEmoji = (category: string) => {
        switch (category) {
            case 'ENTREE': return '🥗';
            case 'PLAT': return '🍽️';
            case 'DESSERT': return '🍰';
            case 'BOISSON': return '🥤';
            default: return '🍴';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'ENTREE': return 'Entrées';
            case 'PLAT': return 'Plats';
            case 'DESSERT': return 'Desserts';
            case 'BOISSON': return 'Boissons';
            default: return category;
        }
    };

    const addToCart = (dish: Dish) => {
        const existingItem = cart.find(item => item.dishId === dish.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.dishId === dish.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                dishId: dish.id,
                dishName: dish.name,
                unitPrice: dish.price,
                quantity: 1,
                category: dish.category,
                allergens: dish.allergens
            }]);
        }
    };

    const removeFromCart = (dishId: string) => {
        setCart(cart.filter(item => item.dishId !== dishId));
    };

    const updateQuantity = (dishId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(dishId);
        } else {
            setCart(cart.map(item =>
                item.dishId === dishId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const goToNextStep = () => {
        switch (currentStep) {
            case 'restaurant':
                setCurrentStep('menu');
                break;
            case 'menu':
                setCurrentStep('cart');
                break;
            case 'cart':
                setCurrentStep('customer');
                break;
            case 'customer':
                setCurrentStep('confirmation');
                break;
        }
    };

    const goToPreviousStep = () => {
        switch (currentStep) {
            case 'menu':
                setCurrentStep('restaurant');
                break;
            case 'cart':
                setCurrentStep('menu');
                break;
            case 'customer':
                setCurrentStep('cart');
                break;
            case 'confirmation':
                setCurrentStep('customer');
                break;
        }
    };

    const finalizeOrder = () => {
        if (!selectedRestaurant || cart.length === 0) {
            return;
        }

        const customerInfo = selectedUser
            ? { id: selectedUser.id, name: selectedUser.fullName }
            : { id: "00000000-0000-0000-0000-000000000000", name: guestName };

        if (!customerInfo.name.trim()) {
            alert('⚠️ Veuillez sélectionner un client ou entrer un nom.');
            return;
        }

        const orderData = {
            idRestaurant: selectedRestaurant.id,
            idUser: customerInfo.id,
            listDishNumber: cart.map(item => ({
                idDish: item.dishId,
                number: item.quantity
            })),
            flatDelivered: isDelivery // Ajout du champ de livraison
        };

        createOrder(orderData, {
            onSuccess: () => {
                setCurrentStep('restaurant');
                setSelectedRestaurant(null);
                setCart([]);
                setSelectedUser(null);
                setGuestName('');
                setSelectedCategory('');
                setSearchTerm('');
                setIsDelivery(false); // Réinitialiser l'option de livraison
                alert(`🎉 Commande créée avec succès pour ${customerInfo.name} !\n${isDelivery ? '🚚 Commande à livrer' : '🏪 Commande à retirer sur place'}\nVotre numéro de commande vous sera communiqué à la caisse.`);
            },
            onError: (error: any) => {
                console.error('Erreur:', error);
                alert('❌ Erreur lors de la création de la commande. Veuillez réessayer.');
            }
        });
    };

    // Vérifier si le restaurant sélectionné supporte la livraison
    const restaurantSupportsDelivery = selectedRestaurant?.restaurantFeatures.includes('PLATEAUX_LIVRABLE') || false;

    if (loadingRestaurants) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-lg">Chargement des restaurants...</p>
                </div>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 'restaurant':
                return (
                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-center">🏪 Choisissez votre Restaurant</h2>

                        {restaurants.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🏪</div>
                                <h3 className="text-2xl font-bold mb-2">Aucun restaurant disponible</h3>
                                <p className="text-base-content/70">Veuillez créer un restaurant pour commencer à prendre des commandes.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {restaurants.map((restaurant) => (
                                    <div key={restaurant.id}
                                         className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer transform hover:scale-105"
                                         onClick={() => {
                                             setSelectedRestaurant(restaurant);
                                             goToNextStep();
                                         }}>
                                        <div className="card-body">
                                            <h2 className="card-title text-xl">{restaurant.name}</h2>
                                            <p className="text-sm opacity-70">📍 {restaurant.address.streetNumber} {restaurant.address.streetName}, {restaurant.address.city}</p>
                                            <p className="text-sm">
                                                🪑 {restaurant.numberPlace} places
                                            </p>
                                            {restaurant.restaurantFeatures.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {restaurant.restaurantFeatures.slice(0, 3).map((feature) => (
                                                        <span key={feature} className={`badge badge-xs ${
                                                            feature === 'PLATEAUX_LIVRABLE' ? 'badge-success' :
                                                                feature === 'WIFI_HAUT_DEBIT' ? 'badge-info' :
                                                                    'badge-outline'
                                                        }`}>
                                                            {feature === 'PLATEAUX_LIVRABLE' ? '🚚 Livraison' :
                                                                feature === 'WIFI_HAUT_DEBIT' ? '📶 WiFi' :
                                                                    feature === 'PLATEAUX_MEMBRES' ? '👥 Plateaux membres' :
                                                                        feature.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="card-actions justify-end">
                                                <button className="btn btn-primary">Choisir →</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'menu':
                return (
                    <div className="space-y-6">
                        {/* Header avec restaurant sélectionné */}
                        <div className="bg-primary text-primary-content p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedRestaurant?.name}</h2>
                                    <p className="opacity-90">📍 {selectedRestaurant?.address.city}</p>
                                    {restaurantSupportsDelivery && (
                                        <div className="badge badge-success badge-sm mt-1">🚚 Livraison disponible</div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">{getTotalItems()} articles</div>
                                    <div className="text-xl font-bold">{getTotalPrice().toFixed(2)}€</div>
                                </div>
                            </div>
                        </div>

                        {/* Filtres par catégorie */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`btn btn-lg ${selectedCategory === '' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                🍴 Tout
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`btn btn-lg ${selectedCategory === category ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    {getCategoryEmoji(category)} {getCategoryLabel(category)}
                                </button>
                            ))}
                        </div>

                        {/* Plats */}
                        {loadingDishes ? (
                            <div className="flex justify-center py-20">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {availableDishes
                                    .filter(dish => !selectedCategory || dish.category === selectedCategory)
                                    .map((dish) => (
                                        <div key={dish.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                                            <div className="card-body p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="text-2xl">{getCategoryEmoji(dish.category)}</div>
                                                    <div className="text-xl font-bold text-primary">{dish.price.toFixed(2)}€</div>
                                                </div>

                                                <h3 className="font-bold text-lg mb-1">{dish.name}</h3>
                                                {dish.description && (
                                                    <p className="text-sm text-base-content/70 mb-2">{dish.description}</p>
                                                )}

                                                {dish.allergens.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {dish.allergens.map(allergen => (
                                                            <span key={allergen} className="badge badge-warning badge-xs">
                                                                ⚠️ {allergen.replace('_', ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="card-actions justify-end">
                                                    <button
                                                        onClick={() => addToCart(dish)}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Ajouter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Bouton fixe en bas */}
                        {cart.length > 0 && (
                            <div className="fixed bottom-4 right-4 z-50">
                                <button
                                    onClick={goToNextStep}
                                    className="btn btn-primary btn-lg shadow-xl"
                                >
                                    🛒 Panier ({getTotalItems()}) - {getTotalPrice().toFixed(2)}€
                                </button>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-4 justify-center pb-20">
                            <button onClick={goToPreviousStep} className="btn btn-outline btn-lg">
                                ← Changer de restaurant
                            </button>
                        </div>
                    </div>
                );

            case 'cart':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-center">🛒 Votre Panier</h2>

                        {cart.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🛒</div>
                                <h3 className="text-2xl font-bold mb-2">Votre panier est vide</h3>
                                <p className="text-base-content/70 mb-6">Ajoutez des plats pour continuer</p>
                                <button onClick={goToPreviousStep} className="btn btn-primary btn-lg">
                                    ← Retour au menu
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Option de livraison si disponible */}
                                {restaurantSupportsDelivery && (
                                    <div className="card bg-base-100 shadow-lg">
                                        <div className="card-body">
                                            <h3 className="card-title">🚚 Options de récupération</h3>
                                            <div className="form-control">
                                                <label className="label cursor-pointer justify-start gap-4">
                                                    <input
                                                        type="radio"
                                                        name="deliveryOption"
                                                        className="radio radio-primary"
                                                        checked={!isDelivery}
                                                        onChange={() => setIsDelivery(false)}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">🏪</span>
                                                        <div>
                                                            <div className="font-bold">Retrait sur place</div>
                                                            <div className="text-sm opacity-70">Gratuit - Venez récupérer votre commande</div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="label cursor-pointer justify-start gap-4">
                                                    <input
                                                        type="radio"
                                                        name="deliveryOption"
                                                        className="radio radio-primary"
                                                        checked={isDelivery}
                                                        onChange={() => setIsDelivery(true)}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">🚚</span>
                                                        <div>
                                                            <div className="font-bold">Livraison de plateaux</div>
                                                            <div className="text-sm opacity-70">Service de livraison disponible</div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Liste des articles */}
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.dishId} className="card bg-base-100 shadow-lg">
                                            <div className="card-body">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-2xl">{getCategoryEmoji(item.category)}</div>
                                                        <div>
                                                            <h3 className="font-bold text-lg">{item.dishName}</h3>
                                                            <p className="text-sm opacity-70">{item.unitPrice.toFixed(2)}€ l'unité</p>
                                                            {item.allergens.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {item.allergens.map(allergen => (
                                                                        <span key={allergen} className="badge badge-warning badge-xs">
                                                                            ⚠️ {allergen.replace('_', ' ')}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="join">
                                                            <button
                                                                onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                                                                className="btn btn-sm join-item"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="join-item btn btn-sm bg-base-200">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                                                                className="btn btn-sm join-item"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-lg">{(item.unitPrice * item.quantity).toFixed(2)}€</div>
                                                            <button
                                                                onClick={() => removeFromCart(item.dishId)}
                                                                className="btn btn-error btn-xs"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="card bg-primary text-primary-content shadow-lg">
                                    <div className="card-body">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-bold">Total de votre commande</h3>
                                                <p className="opacity-90">
                                                    {getTotalItems()} articles • {isDelivery ? '🚚 Livraison' : '🏪 Retrait sur place'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold">{getTotalPrice().toFixed(2)}€</div>
                                                <div className="text-sm opacity-90">TTC</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Boutons de navigation */}
                                <div className="flex gap-4 justify-center">
                                    <button onClick={goToPreviousStep} className="btn btn-outline btn-lg">
                                        ← Continuer les achats
                                    </button>
                                    <button onClick={goToNextStep} className="btn btn-success btn-lg">
                                        Valider la commande →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                );

            case 'customer':
                return (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center">👤 Sélection du Client</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Sélection d'un client existant */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4">🔍 Client existant</h3>

                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Rechercher par nom ou email..."
                                            className="input input-bordered input-lg w-full"
                                        />

                                        {loadingUsers ? (
                                            <div className="flex justify-center py-8">
                                                <span className="loading loading-spinner loading-md"></span>
                                            </div>
                                        ) : (
                                            <div className="max-h-80 overflow-y-auto space-y-2">
                                                {users.length === 0 ? (
                                                    <div className="text-center py-8 text-base-content/50">
                                                        {searchTerm ?
                                                            `Aucun client trouvé pour "${searchTerm}"` :
                                                            "Tapez pour rechercher un client"
                                                        }
                                                    </div>
                                                ) : (
                                                    users.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setGuestName('');
                                                            }}
                                                            className={`card bg-base-200 shadow cursor-pointer transition-colors ${
                                                                selectedUser?.id === user.id ?
                                                                    'bg-primary text-primary-content' :
                                                                    'hover:bg-base-300'
                                                            }`}
                                                        >
                                                            <div className="card-body p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="avatar placeholder">
                                                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                                            <span className="text-xl">{user.fullName.charAt(0)}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold">{user.fullName}</div>
                                                                        <div className="text-sm opacity-70">{user.email}</div>
                                                                    </div>
                                                                    {selectedUser?.id === user.id && (
                                                                        <div className="ml-auto">
                                                                            <span className="text-2xl">✓</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Client occasionnel */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4">👤 Client occasionnel</h3>

                                    <div className="space-y-4">
                                        <p className="text-sm opacity-70">
                                            Pour les clients qui ne sont pas encore inscrits dans le système.
                                        </p>

                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => {
                                                setGuestName(e.target.value);
                                                if (e.target.value.trim()) {
                                                    setSelectedUser(null);
                                                }
                                            }}
                                            placeholder="Nom du client occasionnel..."
                                            className={`input input-bordered input-lg w-full ${
                                                guestName.trim() && !selectedUser ? 'input-success' : ''
                                            }`}
                                        />

                                        {guestName.trim() && !selectedUser && (
                                            <div className="alert alert-success">
                                                <div className="flex items-center gap-2">
                                                    <span>✓</span>
                                                    <span>Client occasionnel : <strong>{guestName}</strong></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Récapitulatif de la commande avec option de livraison */}
                        <div className="card bg-base-200 shadow-lg">
                            <div className="card-body">
                                <h3 className="card-title mb-3">📋 Récapitulatif de votre commande</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                    <div className="bg-base-100 p-4 rounded-lg">
                                        <div className="text-2xl mb-1">🏪</div>
                                        <div className="font-bold">{selectedRestaurant?.name}</div>
                                        <div className="text-sm opacity-70">{selectedRestaurant?.address.city}</div>
                                    </div>
                                    <div className="bg-base-100 p-4 rounded-lg">
                                        <div className="text-2xl mb-1">🛒</div>
                                        <div className="font-bold">{getTotalItems()} articles</div>
                                        <div className="text-sm opacity-70">{cart.length} types de plats</div>
                                    </div>
                                    <div className="bg-base-100 p-4 rounded-lg">
                                        <div className="text-2xl mb-1">{isDelivery ? '🚚' : '🏪'}</div>
                                        <div className="font-bold">{isDelivery ? 'Livraison' : 'Retrait'}</div>
                                        <div className="text-sm opacity-70">{isDelivery ? 'Plateaux livrés' : 'Sur place'}</div>
                                    </div>
                                    <div className="bg-base-100 p-4 rounded-lg">
                                        <div className="text-2xl mb-1">💰</div>
                                        <div className="font-bold text-primary text-xl">{getTotalPrice().toFixed(2)}€</div>
                                        <div className="text-sm opacity-70">Total TTC</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Boutons de navigation */}
                        <div className="flex gap-4 justify-center">
                            <button onClick={goToPreviousStep} className="btn btn-outline btn-lg">
                                ← Retour au panier
                            </button>
                            <button
                                onClick={goToNextStep}
                                disabled={!selectedUser && !guestName.trim()}
                                className="btn btn-success btn-lg"
                            >
                                Continuer →
                                {selectedUser && ` (${selectedUser.fullName})`}
                                {!selectedUser && guestName.trim() && ` (${guestName})`}
                            </button>
                        </div>
                    </div>
                );

            case 'confirmation':
                return (
                    <div className="space-y-6 max-w-3xl mx-auto text-center">
                        <div className="text-8xl">🎉</div>
                        <h2 className="text-4xl font-bold">Confirmation de Commande</h2>

                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="text-2xl font-bold mb-4">Détails de votre commande</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                    <div>
                                        <h4 className="font-bold text-lg mb-2">👤 Client</h4>
                                        <p className="text-xl">
                                            {selectedUser ? selectedUser.fullName : guestName}
                                        </p>
                                        {selectedUser && (
                                            <p className="text-sm opacity-70">{selectedUser.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg mb-2">🏪 Restaurant</h4>
                                        <p className="text-xl">{selectedRestaurant?.name}</p>
                                        <p className="text-sm opacity-70">{selectedRestaurant?.address.city}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg mb-2">{isDelivery ? '🚚' : '🏪'} Mode de récupération</h4>
                                        <p className="text-xl">{isDelivery ? 'Livraison de plateaux' : 'Retrait sur place'}</p>
                                        <p className="text-sm opacity-70">
                                            {isDelivery ? 'Vos plateaux seront livrés' : 'À récupérer au restaurant'}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg mb-2">💰 Total</h4>
                                        <p className="text-2xl font-bold text-primary">{getTotalPrice().toFixed(2)}€</p>
                                        <p className="text-sm opacity-70">{getTotalItems()} articles</p>
                                    </div>
                                </div>

                                <div className="divider"></div>

                                <div className="text-left">
                                    <h4 className="font-bold text-lg mb-3">🍽️ Détail des plats</h4>
                                    <div className="space-y-2">
                                        {cart.map((item) => (
                                            <div key={item.dishId} className="flex justify-between items-center bg-base-200 p-3 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{getCategoryEmoji(item.category)}</span>
                                                    <div>
                                                        <div className="font-medium">{item.dishName}</div>
                                                        <div className="text-sm opacity-70">{item.unitPrice.toFixed(2)}€ × {item.quantity}</div>
                                                    </div>
                                                </div>
                                                <div className="font-bold">{(item.unitPrice * item.quantity).toFixed(2)}€</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button onClick={goToPreviousStep} className="btn btn-outline btn-lg">
                                ← Modifier
                            </button>
                            <button
                                onClick={finalizeOrder}
                                disabled={creatingOrder}
                                className="btn btn-success btn-lg"
                            >
                                {creatingOrder ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Création en cours...
                                    </>
                                ) : (
                                    <>🎯 Finaliser la commande</>
                                )}
                            </button>
                        </div>

                        <div className="alert alert-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>
                                {isDelivery
                                    ? "Une fois confirmée, votre commande sera préparée et livrée selon les modalités du restaurant."
                                    : "Une fois confirmée, votre commande sera préparée et vous pourrez la récupérer au restaurant."
                                }
                            </span>
                        </div>
                    </div>
                );

            default:
                return <div>Étape inconnue</div>;
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            {/* Indicateur d'étapes */}
            <div className="bg-base-100 shadow-sm sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    <ul className="steps steps-horizontal w-full">
                        <li className={`step ${currentStep === 'restaurant' ? 'step-primary' :
                            ['menu', 'cart', 'customer', 'confirmation'].includes(currentStep) ? 'step-primary' : ''}`}>
                            Restaurant
                        </li>
                        <li className={`step ${currentStep === 'menu' ? 'step-primary' :
                            ['cart', 'customer', 'confirmation'].includes(currentStep) ? 'step-primary' : ''}`}>
                            Menu
                        </li>
                        <li className={`step ${currentStep === 'cart' ? 'step-primary' :
                            ['customer', 'confirmation'].includes(currentStep) ? 'step-primary' : ''}`}>
                            Panier
                        </li>
                        <li className={`step ${currentStep === 'customer' ? 'step-primary' :
                            currentStep === 'confirmation' ? 'step-primary' : ''}`}>
                            Client
                        </li>
                        <li className={`step ${currentStep === 'confirmation' ? 'step-primary' : ''}`}>
                            Confirmation
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default KioskOrderPage;