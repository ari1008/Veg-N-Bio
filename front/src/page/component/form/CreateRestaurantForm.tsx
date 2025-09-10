import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateRestaurant } from "../../../api/restaurant/hook/useRestaurant";
import { RestaurantSchema } from "../../../api/restaurant/dto/restaurant";
import type { z as Z } from "zod";

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"] as const;

type RestaurantForm = Z.infer<typeof RestaurantSchema>;

const validateForm = (
    data: RestaurantForm
): { isValid: boolean; errors: Record<string, string> } => {
    try {
        RestaurantSchema.parse(data);
        return { isValid: true, errors: {} };
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            err.issues.forEach((issue) => {
                const path = issue.path.join(".");
                errors[path] = issue.message;
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: { root: "Erreur de validation inconnue" } };
    }
};

export default function CreateRestaurantForm() {
    const navigate = useNavigate();
    const mutation = useCreateRestaurant();

    const {
        register,
        handleSubmit,
        control,
        reset,
        getValues,
        setValue,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<RestaurantForm>({
        mode: "onSubmit",
        defaultValues: {
            name: "",
            numberPlace: 1,
            numberPrinter: 1,
            address: {
                streetNumber: 1,
                streetName: "",
                postalCode: "",
                city: ""
            },
            availability: {
                openingHours: {} as any
            },
            meetingRooms: [],
            restaurantFeatures: []
        }
    });

    // FieldArray pour meetingRooms
    const { fields, append, remove } = useFieldArray({
        control,
        name: "meetingRooms"
    });

    // ---------- Helpers validation au blur ----------
    // Chemin de champ arbitraire (nested/indexé), ex: "address.city" ou "meetingRooms.0.name"
    const validateField = (path: string) => {
        const values = getValues();
        const validation = validateForm(values);
        if (validation.errors[path]) {
            setError(path as any, { type: "manual", message: validation.errors[path] });
        } else {
            clearErrors(path as any);
        }
    };

    // Pour les horaires, on valide start/end individuellement et le jour
    const validateDay = (day: (typeof DAYS)[number]) => {
        validateField(`availability.openingHours.${day}.start`);
        validateField(`availability.openingHours.${day}.end`);
        // Si le schéma impose cohérence start < end, une erreur peut tomber sur le conteneur du jour :
        validateField(`availability.openingHours.${day}`);
    };

    // ---------- Submit ----------
    const onSubmit = async (data: RestaurantForm) => {
        const validation = validateForm(data);
        if (!validation.isValid) {
            // pousse toutes les erreurs dans RHF
            Object.entries(validation.errors).forEach(([path, message]) => {
                setError(path as any, { type: "manual", message });
            });
            const firstError = Object.values(validation.errors)[0];
            toast.error(firstError || "Veuillez corriger les erreurs du formulaire");
            return;
        }

        try {
            await mutation.mutateAsync(data);
            toast.success("Restaurant créé avec succès !");
            reset();
            navigate("/");
        } catch (err: any) {
            // erreurs serveur champ à champ si renvoyées
            const fieldErrors = err?.response?.data?.errors;
            if (fieldErrors && typeof fieldErrors === "object") {
                Object.entries(fieldErrors).forEach(([path, message]) => {
                    setError(path as any, { type: "server", message: String(message) });
                });
                const firstMsg = Object.values(fieldErrors)[0];
                toast.error(String(firstMsg) || "Erreur de validation");
            } else {
                toast.error(err?.message || "Erreur inconnue");
            }
        }
    };

    const features = ["WIFI_HAUT_DEBIT", "PLATEAUX_MEMBRES", "PLATEAUX_LIVRABLE"] as const;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-3xl mx-auto w-full p-4" noValidate>

            {/* Bandeau d’erreurs global (debug/UX) */}
            {Object.keys(errors).length > 0 && (
                <div className="alert alert-error">
          <span>
            Veuillez corriger :{" "}
              {Object.entries(errors).map(([k, v]) => (v?.message ? `${k}: ${String(v.message)}; ` : null))}
          </span>
                </div>
            )}

            {/* Nom */}
            <div>
                <label className="label text-base-content">Nom du restaurant</label>
                <input
                    type="text"
                    {...register("name")}
                    onBlur={() => validateField("name")}
                    className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
                />
                {errors.name && <p className="text-error text-sm">{String(errors.name.message)}</p>}
            </div>

            {/* Places */}
            <div>
                <label className="label text-base-content">Nombre de places</label>
                <input
                    type="number"
                    {...register("numberPlace", { valueAsNumber: true })}
                    onBlur={() => validateField("numberPlace")}
                    className={`input input-bordered w-full ${errors.numberPlace ? "input-error" : ""}`}
                />
                {errors.numberPlace && <p className="text-error text-sm">{String(errors.numberPlace.message)}</p>}
            </div>

            {/* Nombre d’imprimantes */}
            <div>
                <label className="label text-base-content">Nombre d’imprimantes</label>
                <input
                    type="number"
                    {...register("numberPrinter", { valueAsNumber: true })}
                    onBlur={() => validateField("numberPrinter")}
                    className={`input input-bordered w-full ${errors.numberPrinter ? "input-error" : ""}`}
                    min={1}
                    max={10}
                />
                {errors.numberPrinter && (
                    <p className="text-error text-sm">{String(errors.numberPrinter.message)}</p>
                )}
            </div>

            {/* Adresse */}
            <fieldset className="border p-4 rounded">
                <legend className="font-semibold text-lg text-base-content">Adresse</legend>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="number"
                        placeholder="N°"
                        {...register("address.streetNumber", { valueAsNumber: true })}
                        onBlur={() => validateField("address.streetNumber")}
                        className={`input input-bordered w-full ${errors.address?.streetNumber ? "input-error" : ""}`}
                    />
                    <input
                        type="text"
                        placeholder="Rue"
                        {...register("address.streetName")}
                        onBlur={() => validateField("address.streetName")}
                        className={`input input-bordered w-full ${errors.address?.streetName ? "input-error" : ""}`}
                    />
                    <input
                        type="text"
                        placeholder="Code postal"
                        {...register("address.postalCode")}
                        onBlur={() => validateField("address.postalCode")}
                        className={`input input-bordered w-full ${errors.address?.postalCode ? "input-error" : ""}`}
                    />
                    <input
                        type="text"
                        placeholder="Ville"
                        {...register("address.city")}
                        onBlur={() => validateField("address.city")}
                        className={`input input-bordered w-full ${errors.address?.city ? "input-error" : ""}`}
                    />
                </div>
                {/* erreurs d'adresse "globales" si le schéma en déclare */}
                {errors.address?.message && (
                    <p className="text-error text-sm mt-2">{String(errors.address?.message)}</p>
                )}
            </fieldset>

            {/* Features */}
            <div>
                <label className="label text-base-content">Options</label>
                <Controller
                    control={control}
                    name="restaurantFeatures"
                    render={({ field }) => (
                        <div className="flex flex-wrap gap-4">
                            {features.map((f) => (
                                <label key={f} className="cursor-pointer flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={f}
                                        checked={Array.isArray(field.value) && field.value.includes(f)}
                                        onChange={(e) => {
                                            const newValue = e.target.checked
                                                ? [...(field.value ?? []), f]
                                                : (field.value ?? []).filter((val: string) => val !== f);
                                            field.onChange(newValue);
                                            // valide le champ au blur-like
                                            validateField("restaurantFeatures");
                                        }}
                                        className="checkbox"
                                    />
                                    <span>{f.replaceAll("_", " ")}</span>
                                </label>
                            ))}
                        </div>
                    )}
                />
                {errors.restaurantFeatures && (
                    <p className="text-error text-sm">{String(errors.restaurantFeatures.message)}</p>
                )}
            </div>

            {/* Availability */}
            <fieldset className="border p-4 rounded">
                <legend className="font-semibold text-lg text-base-content">Horaires</legend>
                {DAYS.map((day) => (
                    <div key={day} className="flex gap-4 items-center mb-2">
                        <label className="w-24">{day}</label>
                        <input
                            type="time"
                            {...register(`availability.openingHours.${day}.start` as const)}
                            onBlur={() => validateDay(day)}
                            className={`input input-bordered ${errors.availability?.openingHours?.[day as any]?.start ? "input-error" : ""}`}
                        />
                        <span>→</span>
                        <input
                            type="time"
                            {...register(`availability.openingHours.${day}.end` as const)}
                            onBlur={() => validateDay(day)}
                            className={`input input-bordered ${errors.availability?.openingHours?.[day as any]?.end ? "input-error" : ""}`}
                        />
                        {/* erreurs au niveau du jour */}
                        {errors.availability?.openingHours?.[day as any]?.message && (
                            <span className="text-error text-xs ml-2">
                {String(errors.availability?.openingHours?.[day as any]?.message)}
              </span>
                        )}
                    </div>
                ))}
            </fieldset>

            {/* Meeting Rooms */}
            <fieldset className="border p-4 rounded">
                <legend className="font-semibold flex justify-between items-center text-lg text-base-content">
                    Salles de réunion
                    <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => append({ name: "", numberMettingPlace: 1, isReservable: true })}
                    >
                        + Ajouter
                    </button>
                </legend>

                {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-wrap gap-4 mb-2 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                placeholder="Nom"
                                {...register(`meetingRooms.${index}.name` as const)}
                                onBlur={() => validateField(`meetingRooms.${index}.name`)}
                                className={`input input-bordered w-full ${errors.meetingRooms?.[index]?.name ? "input-error" : ""}`}
                            />
                            {errors.meetingRooms?.[index]?.name && (
                                <p className="text-error text-sm">
                                    {String(errors.meetingRooms?.[index]?.name?.message)}
                                </p>
                            )}
                        </div>

                        <div className="w-32">
                            <input
                                type="number"
                                placeholder="Places"
                                {...register(`meetingRooms.${index}.numberMettingPlace` as const, { valueAsNumber: true })}
                                onBlur={() => validateField(`meetingRooms.${index}.numberMettingPlace`)}
                                className={`input input-bordered w-full ${errors.meetingRooms?.[index]?.numberMettingPlace ? "input-error" : ""}`}
                            />
                            {errors.meetingRooms?.[index]?.numberMettingPlace && (
                                <p className="text-error text-sm">
                                    {String(errors.meetingRooms?.[index]?.numberMettingPlace?.message)}
                                </p>
                            )}
                        </div>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register(`meetingRooms.${index}.isReservable` as const)}
                                onBlur={() => validateField(`meetingRooms.${index}.isReservable`)}
                                className="checkbox"
                            />
                            <span>Réservable</span>
                        </label>

                        <button type="button" onClick={() => remove(index)} className="btn btn-sm btn-error">
                            Suppr
                        </button>
                    </div>
                ))}
                {/* erreur de tableau global si définie par le schéma */}
                {errors.meetingRooms?.message && (
                    <p className="text-error text-sm mt-1">{String(errors.meetingRooms?.message)}</p>
                )}
            </fieldset>

            {/* Submit */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    className={`btn btn-primary ${isSubmitting || mutation.isPending ? "loading" : ""}`}
                    disabled={isSubmitting || mutation.isPending}
                >
                    {isSubmitting || mutation.isPending ? "Création…" : "Créer le restaurant"}
                </button>
            </div>
        </form>
    );
}
