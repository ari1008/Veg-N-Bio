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