import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dishSchema, type DishFormData } from "../api/menu/schema/schema.ts";
import Navbar from "./component/navbar.tsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateDish } from "../api/menu/hook/hook.ts";
import type { CreateDishRequest } from "../api/menu/dto/dto.ts";

const CreateDishPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
        getValues,
        trigger,
        setError,
        clearErrors,
    } = useForm<DishFormData>({
        resolver: zodResolver(dishSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: {
            name: "",
            description: "",
            price: 3,
            category: "PLAT",
            available: true,
            allergens: [],
        },
    });

    const createDishMutation = useCreateDish();

    const availableAllergens = [
        "GLUTEN","CRUSTACEANS","EGGS","FISH","PEANUTS","SOYBEANS","MILK","NUTS",
        "CELERY","MUSTARD","SESAME_SEEDS","SULPHITES","LUPIN","MOLLUSCS"
    ] as const;

    const allergenLabels: Record<string, string> = {
        GLUTEN: "Gluten",
        CRUSTACEANS: "Crustacés",
        EGGS: "Œufs",
        FISH: "Poisson",
        PEANUTS: "Arachides",
        SOYBEANS: "Soja",
        MILK: "Lait",
        NUTS: "Fruits à coque",
        CELERY: "Céleri",
        MUSTARD: "Moutarde",
        SESAME_SEEDS: "Graines de sésame",
        SULPHITES: "Sulfites",
        LUPIN: "Lupin",
        MOLLUSCS: "Mollusques",
    };
    const getAllergenLabel = (a: string) => allergenLabels[a] ?? a;

    const handleAllergenToggle = (allergen: string) => {
        const current = getValues("allergens") ?? [];
        const updated = current.includes(allergen)
            ? current.filter((x) => x !== allergen)
            : [...current, allergen];
        setValue("allergens", updated, { shouldValidate: true });
    };

    const validateField = async (field: keyof DishFormData) => {
        const ok = await trigger(field);
        if (ok) clearErrors(field);
    };

    const onInvalid = () => {
        const first = Object.values(errors)[0];
        const message =
            typeof first?.message === "string"
                ? first.message
                : "Veuillez corriger les erreurs du formulaire";
        toast.error(message);
    };

    const onSubmit = (data: DishFormData) => {
        // ✅ payload FLAT pour matcher le DTO Kotlin
        const dishRequest: CreateDishRequest = {
            name: data.name,
            description: data.description ?? "",
            price: data.price,
            category: data.category,
            available: data.available,
            allergens: data.allergens ?? [],
        };

        createDishMutation.mutate(dishRequest, {
            onSuccess: () => {
                toast.success("Plat créé avec succès !");
                queryClient.invalidateQueries({ queryKey: ["dishes"] });
                reset();
                navigate("/dashboard");
            },
            onError: (error: any) => {
                const fieldErrors = error?.response?.data?.errors;
                if (fieldErrors && typeof fieldErrors === "object") {
                    Object.entries(fieldErrors).forEach(([field, msg]) => {
                        setError(field as keyof DishFormData, {
                            type: "server",
                            message: String(msg),
                        });
                    });
                    const firstMsg = Object.values(fieldErrors)[0];
                    toast.error(String(firstMsg) || "Erreur de validation");
                } else {
                    toast.error(
                        error?.response?.data?.message ||
                        error?.message ||
                        "Erreur lors de la création du plat"
                    );
                }
            },
        });
    };

    const allergensWatch = watch("allergens") ?? [];

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            <div className="max-w-3xl mx-auto p-6">
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Créer un nouveau plat 🍽️</h1>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => navigate("/dashboard")}
                            >
                                ← Retour
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
                            {/* Nom */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Nom du plat *</span>
                                </label>
                                <input
                                    type="text"
                                    className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
                                    placeholder="Ex: Salade César végétarienne"
                                    {...register("name")}
                                    onBlur={() => validateField("name")}
                                />
                                {errors.name && (
                                    <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.name.message as string}
                    </span>
                                    </label>
                                )}
                            </div>

                            {/* Description */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Description</span>
                                </label>
                                <textarea
                                    className={`textarea textarea-bordered h-24 ${errors.description ? "textarea-error" : ""}`}
                                    placeholder="Décrivez votre plat..."
                                    {...register("description")}
                                    onBlur={() => validateField("description")}
                                />
                                {errors.description && (
                                    <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.description.message as string}
                    </span>
                                    </label>
                                )}
                            </div>

                            {/* Prix & Catégorie */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Prix (€) *</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="3"
                                        max="1000"
                                        className={`input input-bordered w-full ${errors.price ? "input-error" : ""}`}
                                        {...register("price", { valueAsNumber: true })}
                                        onBlur={() => validateField("price")}
                                    />
                                    {errors.price && (
                                        <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.price.message as string}
                      </span>
                                        </label>
                                    )}
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Catégorie *</span>
                                    </label>
                                    <select
                                        className={`select select-bordered w-full ${errors.category ? "select-error" : ""}`}
                                        {...register("category")}
                                        onBlur={() => validateField("category")}
                                    >
                                        <option value="ENTREE">🥗 Entrée</option>
                                        <option value="PLAT">🍽️ Plat</option>
                                        <option value="DESSERT">🍰 Dessert</option>
                                        <option value="BOISSON">🥤 Boisson</option>
                                    </select>
                                    {errors.category && (
                                        <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.category.message as string}
                      </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Disponibilité */}
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-2">
                                    <input type="checkbox" className="checkbox checkbox-primary" {...register("available")} />
                                    <span className="label-text font-medium">Disponible immédiatement</span>
                                </label>
                            </div>

                            {/* Allergènes */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Allergènes</span>
                                    {errors.allergens && (
                                        <span className="label-text-alt text-error">
                      {errors.allergens.message as string}
                    </span>
                                    )}
                                </label>

                                {/* fix classe Tailwind: md:grid-cols-3 (et non md-grid-cols-3) */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {availableAllergens.map((a) => (
                                        <label key={a} className="label cursor-pointer justify-start gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-warning checkbox-xs"
                                                checked={allergensWatch.includes(a)}
                                                onChange={() => handleAllergenToggle(a)}
                                            />
                                            <span className="label-text text-xs">{getAllergenLabel(a)}</span>
                                        </label>
                                    ))}
                                </div>

                                {allergensWatch.length > 0 && (
                                    <div className="mt-2">
                                        <span className="text-xs text-warning">Allergènes sélectionnés: </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {allergensWatch.map((a) => (
                                                <span key={a} className="badge badge-warning badge-xs">
                          {getAllergenLabel(a)}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        reset();
                                        navigate("/dashboard");
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${isSubmitting || createDishMutation.isPending ? "btn-disabled" : ""}`}
                                    disabled={isSubmitting || createDishMutation.isPending}
                                >
                                    {createDishMutation.isPending ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Création...
                                        </>
                                    ) : (
                                        "Créer le plat"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDishPage;
