import { CreateUserDTO } from "../../../api/auth/dto/createUserDto.ts";
import { useCreateUser } from "../../../api/auth/hook/useCreateUser.ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ConfirmPasswordDTO = CreateUserDTO.extend({
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type ConfirmPasswordUser = z.infer<typeof ConfirmPasswordDTO>;

export default function RegisterForm() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ConfirmPasswordUser>({
        resolver: zodResolver(ConfirmPasswordDTO),
        mode: "onTouched",
    });

    const mutation = useCreateUser();

    const onSubmit = async (data: ConfirmPasswordUser) => {
        try {
            const { confirmPassword, ...createUserDataWithoutConfirm } = data;

            const createUserData = {
                ...createUserDataWithoutConfirm,
                role: "RESTAURANT_OWNER",
            };

            console.log(createUserData);

            await mutation.mutateAsync(createUserData);
            toast.success("Compte créé avec succès !");
            reset();
            navigate("/login");
        } catch (err: any) {
            toast.error(err?.message || "Erreur inconnue lors de la création du compte");
        }
    };


    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            noValidate
        >
            {/** Username */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Nom d'utilisateur</span>
                </label>
                <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    className={`input input-bordered w-full ${
                        errors.username ? "input-error" : ""
                    }`}
                    {...register("username")}
                    aria-invalid={!!errors.username}
                    aria-describedby="username-error"
                />
                {errors.username && (
                    <label className="label">
            <span
                id="username-error"
                className="label-text-alt text-error"
                role="alert"
            >
              {errors.username.message}
            </span>
                    </label>
                )}
            </div>

            {/** Email */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Email</span>
                </label>
                <input
                    type="email"
                    placeholder="Email"
                    className={`input input-bordered w-full ${
                        errors.email ? "input-error" : ""
                    }`}
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby="email-error"
                />
                {errors.email && (
                    <label className="label">
            <span
                id="email-error"
                className="label-text-alt text-error"
                role="alert"
            >
              {errors.email.message}
            </span>
                    </label>
                )}
            </div>

            {/** First Name */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Prénom</span>
                </label>
                <input
                    type="text"
                    placeholder="Prénom"
                    className={`input input-bordered w-full ${
                        errors.firstName ? "input-error" : ""
                    }`}
                    {...register("firstName")}
                    aria-invalid={!!errors.firstName}
                    aria-describedby="firstName-error"
                />
                {errors.firstName && (
                    <label className="label">
            <span
                id="firstName-error"
                className="label-text-alt text-error"
                role="alert"
            >
              {errors.firstName.message}
            </span>
                    </label>
                )}
            </div>

            {/** Last Name */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Nom</span>
                </label>
                <input
                    type="text"
                    placeholder="Nom"
                    className={`input input-bordered w-full ${
                        errors.lastName ? "input-error" : ""
                    }`}
                    {...register("lastName")}
                    aria-invalid={!!errors.lastName}
                    aria-describedby="lastName-error"
                />
                {errors.lastName && (
                    <label className="label">
            <span
                id="lastName-error"
                className="label-text-alt text-error"
                role="alert"
            >
              {errors.lastName.message}
            </span>
                    </label>
                )}
            </div>

            {/** Password */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Mot de passe</span>
                </label>
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className={`input input-bordered w-full ${
                        errors.password ? "input-error" : ""
                    }`}
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    aria-describedby="password-error"
                />
                {errors.password && (
                    <label className="label">
            <span
                id="password-error"
                className="label-text-alt text-error"
                role="alert"
            >
              {errors.password.message}
            </span>
                    </label>
                )}
            </div>

            {/** Confirm Password */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Confirmer le mot de passe</span>
                </label>
                <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    className={`input input-bordered w-full ${
                        errors.confirmPassword ? "input-error" : ""
                    }`}
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby="confirmPassword-error"
                />
                {errors.confirmPassword && (
                    <label className="label">
            <span
                id="confirmPassword-error"
                className="label-text-alt text-error"
                role="alert"
            >
              {errors.confirmPassword.message}
            </span>
                    </label>
                )}
            </div>

            <button
                type="submit"
                className={`btn btn-success mt-4 ${mutation.isPending || isSubmitting ? "loading" : ""}`}
                disabled={mutation.isPending || isSubmitting}
            >
                {mutation.isPending || isSubmitting ? "Création en cours…" : "Créer un compte"}
            </button>
        </form>
    );
}
