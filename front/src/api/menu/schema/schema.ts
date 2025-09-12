import {z} from "zod";

export const dishSchema = z.object({
    name: z.string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(200, 'Le nom ne peut pas dépasser 200 caractères')
        .trim(),
    description: z.string()
        .max(1000, 'La description ne peut pas dépasser 1000 caractères')
        .optional()
        .default(''),
    price: z.number()
        .min(3, 'Le prix minimum est de 3€')
        .max(1000, 'Le prix maximum est de 1000€')
        .multipleOf(0.01, 'Le prix doit être arrondi au centime'),
    category: z.enum(['ENTREE', 'PLAT', 'DESSERT', 'BOISSON']),
    available: z.boolean().default(true),
    allergens: z.array(z.enum([
        'GLUTEN',
        'CRUSTACEANS',
        'EGGS',
        'FISH',
        'PEANUTS',
        'SOYBEANS',
        'MILK',
        'NUTS',
        'CELERY',
        'MUSTARD',
        'SESAME_SEEDS',
        'SULPHITES',
        'LUPIN',
        'MOLLUSCS'
    ])).default([])
});

type DishFormData = z.infer<typeof dishSchema>;


export const dishNumberSchema = z.object({
    dishId: z.string()
        .min(1, "L'ID du plat est requis")
        .uuid("L'ID du plat doit être un UUID valide"),
    number: z.number()
        .int("La quantité doit être un nombre entier")
        .min(1, "La quantité doit être d'au moins 1")
        .max(50, "La quantité ne peut pas dépasser 50"),
});

export const createOrderSchema = z.object({
    idRestaurant: z.string()
        .min(1, "L'ID du restaurant est requis")
        .uuid("L'ID du restaurant doit être un UUID valide"),
    idUser: z.string()
        .min(1, "L'ID de l'utilisateur est requis")
        .uuid("L'ID de l'utilisateur doit être un UUID valide"),
    listDishNumber: z.array(dishNumberSchema)
        .min(1, "Au moins un plat doit être sélectionné")
        .max(20, "Maximum 20 plats par commande"),
});

export const orderFormSchema = z.object({
    customerName: z.string()
        .min(1, "Le nom du client est requis")
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(100, "Le nom ne peut pas dépasser 100 caractères")
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets"),

    customerId: z.string()
        .uuid("L'ID client doit être un UUID valide")
        .optional()
        .or(z.literal("")),

    restaurantId: z.string()
        .min(1, "L'ID du restaurant est requis")
        .uuid("L'ID du restaurant doit être un UUID valide"),
});

export const orderLineSchema = z.object({
    dishId: z.string()
        .min(1, "L'ID du plat est requis")
        .uuid("L'ID du plat doit être un UUID valide"),
    dishName: z.string().min(1, "Le nom du plat est requis"),
    unitPrice: z.number().min(0, "Le prix doit être positif"),
    quantity: z.number()
        .int("La quantité doit être un nombre entier")
        .min(1, "La quantité doit être d'au moins 1")
        .max(50, "La quantité ne peut pas dépasser 50"),
    allergens: z.array(z.string()).default([]),
});

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
export type OrderFormData = z.infer<typeof orderFormSchema>;
export type OrderLineData = z.infer<typeof orderLineSchema>;
export type DishNumberData = z.infer<typeof dishNumberSchema>;