import { CreateUserDTO } from "../../../api/auth/dto/createUserDto.ts";
import { useCreateUser } from "../../../api/auth/hook/useCreateUser.ts";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ConfirmPasswordDTO = CreateUserDTO.omit({ role: true }).extend({
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type ConfirmPasswordUser = z.infer<typeof ConfirmPasswordDTO>;

// Validation manuelle sans zodResolver
const validateForm = (data: any): { isValid: boolean; errors: Record<string, string> } => {
    try {
        ConfirmPasswordDTO.parse(data);
        return { isValid: true, errors: {} };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                errors[path] = issue.message;
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: { root: "Erreur de validation inconnue" } };
    }
};

export default function RegisterForm() {
    const navigate = useNavigate();
    const mutation = useCreateUser();

    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
        reset,
        getValues,
        setError,
        clearErrors,
        formState: { errors }
    } = useForm<ConfirmPasswordUser>({
        // Pas de resolver, on fait la validation manuellement
        mode: "onSubmit",
        defaultValues: {
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ConfirmPasswordUser) => {
        try {
            // Validation manuelle avec Zod
            const validation = validateForm(data);

            if (!validation.isValid) {
                // Appliquer les erreurs au formulaire
                Object.entries(validation.errors).forEach(([field, message]) => {
                    setError(field as keyof ConfirmPasswordUser, {
                        type: "manual",
                        message: message,
                    });
                });

                // Afficher un toast avec la première erreur
                const firstError = Object.values(validation.errors)[0];
                toast.error(firstError || "Veuillez corriger les erreurs du formulaire");
                return;
            }

            // Si validation OK, continuer avec la soumission
            console.log("Validation réussie, soumission avec les données:", data);
            const { confirmPassword, ...payload } = data;
            const createUserData = { ...payload, role: "RESTAURANT_OWNER" };

            await mutation.mutateAsync(createUserData);
            toast.success("Compte créé avec succès !");
            reset();
            navigate("/login");
        } catch (err: any) {
            console.error("Erreur lors de la soumission:", err);
            toast.error(err?.message || "Erreur lors de la création du compte");
        }
    };

    // Validation d'un champ spécifique au blur
    const validateField = (fieldName: keyof ConfirmPasswordUser) => {
        const values = getValues();
        const validation = validateForm(values);

        if (validation.errors[fieldName]) {
            setError(fieldName, {
                type: "manual",
                message: validation.errors[fieldName],
            });
        } else {
            clearErrors(fieldName);
        }
    };

    const isLoading = isSubmitting || mutation.isPending;

    return (
        <div className="w-full max-w-md mx-auto">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
                noValidate
            >
                {/* Username */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Nom d'utilisateur</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur (min. 3 caractères, lettres/chiffres/_)"
                        className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`}
                        {...register("username")}
                        onBlur={() => validateField("username")}
                    />
                    {errors.username && (
                        <label className="label">
                            <span className="label-text-alt text-error">
                                {errors.username.message}
                            </span>
                        </label>
                    )}
                </div>

                {/* Email */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>
                    <input
                        type="email"
                        placeholder="votre@email.com"
                        className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                        {...register("email")}
                        onBlur={() => validateField("email")}
                    />
                    {errors.email && (
                        <label className="label">
                            <span className="label-text-alt text-error">
                                {errors.email.message}
                            </span>
                        </label>
                    )}
                </div>

                {/* First Name */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Prénom</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Prénom (min. 2 caractères)"
                        className={`input input-bordered w-full ${errors.firstName ? "input-error" : ""}`}
                        {...register("firstName")}
                        onBlur={() => validateField("firstName")}
                    />
                    {errors.firstName && (
                        <label className="label">
                            <span className="label-text-alt text-error">
                                {errors.firstName.message}
                            </span>
                        </label>
                    )}
                </div>

                {/* Last Name */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Nom</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nom de famille"
                        className={`input input-bordered w-full ${errors.lastName ? "input-error" : ""}`}
                        {...register("lastName")}
                        onBlur={() => validateField("lastName")}
                    />
                    {errors.lastName && (
                        <label className="label">
                            <span className="label-text-alt text-error">
                                {errors.lastName.message}
                            </span>
                        </label>
                    )}
                </div>

                {/* Password */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Mot de passe</span>
                    </label>
                    <input
                        type="password"
                        placeholder="Min. 8 caractères avec maj, min, chiffre et symbole"
                        className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
                        {...register("password")}
                        onBlur={() => validateField("password")}
                    />
                    {errors.password && (
                        <label className="label">
                            <span className="label-text-alt text-error">
                                {errors.password.message}
                            </span>
                        </label>
                    )}
                    <label className="label">
                        <span className="label-text-alt">
                            Le mot de passe doit contenir: 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                        </span>
                    </label>
                </div>

                {/* Confirm Password */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Confirmer le mot de passe</span>
                    </label>
                    <input
                        type="password"
                        placeholder="Confirmez votre mot de passe"
                        className={`input input-bordered w-full ${errors.confirmPassword ? "input-error" : ""}`}
                        {...register("confirmPassword")}
                        onBlur={() => validateField("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <label className="label">
                            <span className="label-text-alt text-error">
                                {errors.confirmPassword.message}
                            </span>
                        </label>
                    )}
                </div>

                <button
                    type="submit"
                    className={`btn btn-success mt-4 ${isLoading ? "btn-disabled" : ""}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Création en cours…
                        </div>
                    ) : (
                        "Créer un compte"
                    )}
                </button>
            </form>
        </div>
    );
}