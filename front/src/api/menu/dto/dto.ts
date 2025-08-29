export interface OrderSummary {
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELED';
    customerName: string;
    totalAmount: number;
    createdAt: string;
}

export interface OrderListResponse {
    content: OrderSummary[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface OrderLine {
    id: string;
    dishName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    allergens: string[];
}

export interface OrderDetail {
    id: string;
    status: string;
    customerId: string;
    customerName: string;
    totalAmount: number;
    lines: OrderLine[];
    createdAt: string;
}

export interface OrderFilters {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
}

export interface StatusUpdate {
    status: string;
}


// Types pour le menu
export interface Dish {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: 'ENTREE' | 'PLAT' | 'DESSERT' | 'BOISSON';
    available: boolean;
    allergens: string[];
}

export type CreateDishRequest = {
    name: string;
    description?: string;
    price: number;
    category: "ENTREE" | "PLAT" | "DESSERT" | "BOISSON";
    available: boolean;
    allergens: (
        | "GLUTEN" | "CRUSTACEANS" | "EGGS" | "FISH" | "PEANUTS" | "SOYBEANS" | "MILK"
        | "NUTS" | "CELERY" | "MUSTARD" | "SESAME_SEEDS" | "SULPHITES" | "LUPIN" | "MOLLUSCS"
        )[];
};

export interface DishNumber {
    idDish: string;
    number: number;
}

export interface CreateOrderRequest {
    idRestaurant: string;
    idUser: string;
    listDishNumber: DishNumber[];
}

export interface CreateOrderRequestSimple {
    customerName: string;
    customerId?: string;
    lines: {
        idDish: string;
        quantity: number;
    }[];
}

