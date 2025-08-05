import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {LoginDto} from "../../../api/auth/dto/loginDto.ts";
import {postLogin} from "../../../api/auth/auth.ts";
import {useAuthStore} from "../../../api/auth/store/store.ts";
import type {LoginResponse} from "../../../api/auth/response/loginResponse.ts";

export default function LoginForm() {
    const navigate = useNavigate();
    const setAuthData = useAuthStore((state) => state.setAuthData);

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginDto>({
        resolver: zodResolver(LoginDto),
        mode: "onTouched",
    });

    const mutation = useMutation({
        mutationFn: (data: LoginDto) => postLogin(data),
        onSuccess: (data: LoginResponse) => {
            toast.success("Connexion réussie !");
            setAuthData(data);
                navigate("/");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Erreur lors de la connexion");
            console.log("no")
        },
    });

    const onSubmit = (data: LoginDto) => {
        mutation.mutate(data);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-md mx-auto p-8 bg-base-100 rounded-lg shadow-md flex flex-col gap-6"
            noValidate
        >
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Nom d'utilisateur</span>
                </label>
                <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    {...register("username")}
                    className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`}
                    aria-invalid={!!errors.username}
                    aria-describedby="username-error"
                />
                {errors.username && (
                    <label className="label">
            <span id="username-error" className="label-text-alt text-error" role="alert">
              {errors.username.message}
            </span>
                    </label>
                )}
            </div>

            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Mot de passe</span>
                </label>
                <input
                    type="password"
                    placeholder="Mot de passe"
                    {...register("password")}
                    className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
                    aria-invalid={!!errors.password}
                    aria-describedby="password-error"
                />
                {errors.password && (
                    <label className="label">
            <span id="password-error" className="label-text-alt text-error" role="alert">
              {errors.password.message}
            </span>
                    </label>
                )}
            </div>

            <button
                type="submit"
                className={`btn btn-primary mt-4 ${mutation.isPending || isSubmitting ? "loading" : ""}`}
                disabled={mutation.isPending || isSubmitting}
            >
                {mutation.isPending || isSubmitting ? "Connexion en cours…" : "Se connecter"}
            </button>
        </form>
    );
}
