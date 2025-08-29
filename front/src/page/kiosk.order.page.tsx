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

    const { mutate: loadRestaurants, data: restaurants = [], isPending: loadingRestaurants } = useGetAllRestaurant();
    const { data: dishes = [], isLoading: loadingDishes } = useGetAllDishes();
    const { mutate: createOrder, isPending: creatingOrder } = useCreateOrder();

    const { users, isLoading: loadingUsers, searchTerm, setSearchTerm } = useUserSearch(20);

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

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

    const addToCart = (dish: Dish) => {
        const existingItem = cart.find(item => item.dishId === dish.id);

        if (existingItem) {
            setCart(cart.map(item =>
                item.dishId === dish.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            const newItem: CartItem = {
                dishId: dish.id,
                dishName: dish.name,
                unitPrice: dish.price,
                quantity: 1,
                category: dish.category,
                allergens: dish.allergens
            };
            setCart([...cart, newItem]);
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
            }))
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
                alert(`🎉 Commande créée avec succès pour ${customerInfo.name} !\nVotre numéro de commande vous sera communiqué à la caisse.`);
            },
            onError: (error: any) => {
                console.error('Erreur:', error);
                alert('❌ Erreur lors de la création de la commande. Veuillez réessayer.');
            }
        });
    };


    const renderStep = () => {
        switch (currentStep) {
            case 'restaurant':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-4">
                            <h1 className="text-6xl font-bold text-primary">Bienvenue chez Veg'N Bio</h1>
                            <p className="text-2xl text-base-content/70">Choisissez votre restaurant</p>
                        </div>

                        {loadingRestaurants ? (
                            <div className="flex justify-center py-20">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                {restaurants.map((restaurant) => (
                                    <div
                                        key={restaurant.id}
                                        onClick={() => {
                                            setSelectedRestaurant(restaurant);
                                            goToNextStep();
                                        }}
                                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
                                    >
                                        <div className="card-body">
                                            <h2 className="card-title text-xl">{restaurant.name}</h2>
                                            <p className="text-sm opacity-70">
                                                📍 {restaurant.address.city}
                                            </p>
                                            <p className="text-sm">
                                                🪑 {restaurant.numberPlace} places
                                            </p>
                                            {restaurant.restaurantFeatures.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {restaurant.restaurantFeatures.slice(0, 3).map((feature) => (
                                                        <span key={feature} className="badge badge-outline badge-xs">
                              {feature.replace('_', ' ')}
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

                                                <h3 className="card-title text-lg">{dish.name}</h3>

                                                {dish.description && (
                                                    <p className="text-sm opacity-70 line-clamp-2">{dish.description}</p>
                                                )}

                                                {dish.allergens.length > 0 && (
                                                    <div className="text-xs text-warning">
                                                        ⚠️ {dish.allergens.slice(0, 2).map(getAllergenLabel).join(', ')}
                                                        {dish.allergens.length > 2 && '...'}
                                                    </div>
                                                )}

                                                <div className="card-actions justify-end mt-2">
                                                    <button
                                                        onClick={() => addToCart(dish)}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        + Ajouter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Bouton continuer */}
                        {cart.length > 0 && (
                            <div className="fixed bottom-4 right-4">
                                <button
                                    onClick={goToNextStep}
                                    className="btn btn-success btn-lg shadow-xl"
                                >
                                    Voir le panier ({getTotalItems()}) →
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'cart':
                return (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center">🛒 Votre Panier</h2>

                        {cart.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🛒</div>
                                <p className="text-xl text-base-content/50">Votre panier est vide</p>
                                <button onClick={goToPreviousStep} className="btn btn-primary mt-4">
                                    ← Retour au menu
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {cart.map((item, index) => (
                                        <div key={index} className="card bg-base-100 shadow-lg">
                                            <div className="card-body">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl">{getCategoryEmoji(item.category)}</div>
                                                            <div>
                                                                <h3 className="font-bold text-lg">{item.dishName}</h3>
                                                                <p className="text-sm opacity-70">{item.unitPrice.toFixed(2)}€ l'unité</p>
                                                                {item.allergens.length > 0 && (
                                                                    <div className="text-xs text-warning mt-1">
                                                                        ⚠️ {item.allergens.map(getAllergenLabel).join(', ')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                                                                className="btn btn-circle btn-sm btn-outline"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-xl font-bold w-12 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                                                                className="btn btn-circle btn-sm btn-outline"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-xl font-bold text-primary">
                                                                {(item.unitPrice * item.quantity).toFixed(2)}€
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => removeFromCart(item.dishId)}
                                                            className="btn btn-circle btn-sm btn-error"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="card bg-primary text-primary-content shadow-xl">
                                    <div className="card-body">
                                        <div className="flex justify-between items-center text-2xl font-bold">
                                            <span>Total ({getTotalItems()} articles)</span>
                                            <span>{getTotalPrice().toFixed(2)}€</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Boutons */}
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
                                                        {searchTerm ? 'Aucun client trouvé' : 'Tapez pour rechercher un client'}
                                                    </div>
                                                ) : (
                                                    users.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setGuestName('');
                                                            }}
                                                            className={`card cursor-pointer transition-all hover:shadow-md ${
                                                                selectedUser?.id === user.id
                                                                    ? 'bg-primary text-primary-content shadow-lg border-2 border-primary'
                                                                    : 'bg-base-200 hover:bg-base-300'
                                                            }`}
                                                        >
                                                            <div className="card-body compact p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h4 className="font-bold text-lg">{user.fullName}</h4>
                                                                        <p className="text-sm opacity-70">@{user.username}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm opacity-70">{user.email}</p>
                                                                        {selectedUser?.id === user.id && (
                                                                            <div className="badge badge-accent mt-1">✓ Sélectionné</div>
                                                                        )}
                                                                    </div>
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
                                    <h3 className="card-title text-xl mb-4">👥 Client occasionnel</h3>

                                    <div className="space-y-4">
                                        <p className="text-sm text-base-content/70">
                                            Pour un client qui n'a pas de compte, entrez simplement son nom :
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
                                            placeholder="Nom du client occasionnel"
                                            className={`input input-bordered input-lg w-full ${
                                                guestName && !selectedUser ? 'input-success' : ''
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

                        {/* Récapitulatif de la commande */}
                        <div className="card bg-base-200 shadow-lg">
                            <div className="card-body">
                                <h3 className="card-title mb-3">📋 Récapitulatif de votre commande</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
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
                                            <p className="text-sm opacity-70">@{selectedUser.username}</p>
                                        )}
                                        {!selectedUser && guestName && (
                                            <p className="text-sm opacity-70">Client occasionnel</p>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg mb-2">🏪 Restaurant</h4>
                                        <p className="font-medium">{selectedRestaurant?.name}</p>
                                        <p className="text-sm opacity-70">{selectedRestaurant?.address.city}</p>
                                    </div>
                                </div>

                                <div className="divider"></div>

                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg">🛒 Articles commandés</h4>
                                    {cart.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span>{item.quantity}x {item.dishName}</span>
                                            <span className="font-medium">{(item.unitPrice * item.quantity).toFixed(2)}€</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="divider"></div>

                                <div className="text-2xl font-bold text-primary">
                                    Total : {getTotalPrice().toFixed(2)}€
                                </div>

                                <div className="card-actions justify-center gap-4 mt-6">
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
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            '✅ Finaliser la commande'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Navbar */}
            <Navbar />

            <div className="p-4">
                {/* Header avec navigation */}
                {currentStep !== 'restaurant' && (
                    <div className="max-w-6xl mx-auto mb-6">
                        <div className="flex items-center justify-between bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                            <button
                                onClick={goToPreviousStep}
                                className="btn btn-ghost btn-lg"
                            >
                                ← Retour
                            </button>

                            <div className="flex items-center gap-2">
                                <div className={`badge ${currentStep === 'restaurant' ? 'badge-primary' : 'badge-outline'}`}>
                                    1. Restaurant
                                </div>
                                <div className={`badge ${currentStep === 'menu' ? 'badge-primary' : 'badge-outline'}`}>
                                    2. Menu
                                </div>
                                <div className={`badge ${currentStep === 'cart' ? 'badge-primary' : 'badge-outline'}`}>
                                    3. Panier
                                </div>
                                <div className={`badge ${currentStep === 'customer' ? 'badge-primary' : 'badge-outline'}`}>
                                    4. Client
                                </div>
                                <div className={`badge ${currentStep === 'confirmation' ? 'badge-primary' : 'badge-outline'}`}>
                                    5. Confirmation
                                </div>
                            </div>

                            <div className="text-right">
                                {cart.length > 0 && (
                                    <div className="text-sm">
                                        <div>{getTotalItems()} articles</div>
                                        <div className="font-bold text-primary">{getTotalPrice().toFixed(2)}€</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenu principal */}
                <div className="max-w-7xl mx-auto">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default KioskOrderPage;