import { z } from 'zod';

export const CreateUserDTO = z.object({
    username: z
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: 'Le nom d’utilisateur ne doit contenir que des lettres, chiffres ou underscores.',
        }),

    email: z
        .string()
        .regex(/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/, {
            message: 'Email invalide.',
        }),

    firstName: z
        .string()
        .min(2)
        .regex(/^[A-Z][a-zA-Z-'éèêëàâäïîôöùûüç ]*$/, {
            message: 'Le prénom doit commencer par une majuscule.',
        }),

    lastName: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Z][a-zA-Z-'éèêëàâäïîôöùûüç ]*$/, {
            message: 'Le nom doit commencer par une majuscule.',
        }),

    password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^\-])[A-Za-z\d@$!%*?&.#^\-]{8,}$/, {
            message:
                'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.',
        }),
});

export type CreateUser = z.infer<typeof CreateUserDTO>;

