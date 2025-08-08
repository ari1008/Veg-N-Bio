import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateRestaurant } from "../../../api/restaurant/hook/useRestaurant";
import { RestaurantSchema } from "../../../api/restaurant/dto/restaurant";
import type { z } from "zod";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

type RestaurantForm = z.infer<typeof RestaurantSchema>;

export default function CreateRestaurantForm() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RestaurantForm>({
        resolver: zodResolver(RestaurantSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            numberPlace: 1,
            address: {
                streetNumber: 1,
                streetName: "",
                postalCode: "",
                city: ""
            },
            availability: {
                openingHours: {}
            },
            meetingRooms: [],
            restaurantFeatures: []
        }
    });

    const mutation = useCreateRestaurant();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "meetingRooms"
    });

    const onSubmit = async (data: RestaurantForm) => {
        try {
            await mutation.mutateAsync(data);
            toast.success("Restaurant créé avec succès !");
            reset();
            navigate("/restaurants");
        } catch (err: any) {
            toast.error(err?.message || "Erreur inconnue");
        }
    };

    const features = ["WIFI_HAUT_DEBIT", "PLATEAUX_MEMBRES", "PLATEAUX_LIVRABLE"];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-3xl mx-auto w-full p-4">

            {/* Nom */}
            <div>
                <label className="label text-base-content">Nom du restaurant</label>
                <input type="text" {...register("name")} className="input input-bordered w-full" />
                {errors.name && <p className="text-error text-sm">{errors.name.message}</p>}
            </div>

            {/* Places */}
            <div>
                <label className="label text-base-content">Nombre de places</label>
                <input type="number" {...register("numberPlace", { valueAsNumber: true })} className="input input-bordered w-full" />
                {errors.numberPlace && <p className="text-error text-sm">{errors.numberPlace.message}</p>}
            </div>

            {/* Nombre d’imprimantes */}
            <div>
                <label className="label text-base-content">Nombre d’imprimantes</label>
                <input
                    type="number"
                    {...register("numberPrinter", { valueAsNumber: true })}
                    className={`input input-bordered w-full ${errors.numberPrinter ? "input-error" : ""}`}
                    min={1}
                    max={10}
                />
                {errors.numberPrinter && (
                    <p className="text-error text-sm">{errors.numberPrinter.message}</p>
                )}
            </div>

            {/* Adresse */}
            <fieldset className="border p-4 rounded">
                <legend className="font-semibold text-lg text-base-content">Adresse</legend>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="N°" {...register("address.streetNumber", { valueAsNumber: true })} className="input input-bordered w-full" />
                    <input type="text" placeholder="Rue" {...register("address.streetName")} className="input input-bordered w-full" />
                    <input type="text" placeholder="Code postal" {...register("address.postalCode")} className="input input-bordered w-full" />
                    <input type="text" placeholder="Ville" {...register("address.city")} className="input input-bordered w-full" />
                </div>
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
                                        checked={field.value.includes(f)}
                                        onChange={(e) => {
                                            const newValue = e.target.checked
                                                ? [...field.value, f]
                                                : field.value.filter((val: string) => val !== f);
                                            field.onChange(newValue);
                                        }}
                                        className="checkbox"
                                    />
                                    <span>{f.replace("_", " ")}</span>
                                </label>
                            ))}
                        </div>
                    )}
                />
            </div>

            {/* Availability */}
            <fieldset className="border p-4 rounded">
                <legend className="font-semibold text-lg text-base-content">Horaires</legend>
                {DAYS.map((day) => (
                    <div key={day} className="flex gap-4 items-center mb-2">
                        <label className="w-24">{day}</label>
                        <input type="time" {...register(`availability.openingHours.${day}.start`)} className="input input-bordered" />
                        <span>→</span>
                        <input type="time" {...register(`availability.openingHours.${day}.end`)} className="input input-bordered" />
                    </div>
                ))}
            </fieldset>

            {/* Meeting Rooms */}
            <fieldset className="border p-4 rounded">
                <legend className="font-semibold flex justify-between items-center text-lg text-base-content">
                    Salles de réunion
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => append({ name: "", numberMettingPlace: 1, isReservable: true })}>
                        + Ajouter
                    </button>
                </legend>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 mb-2 items-end">
                        <input placeholder="Nom" {...register(`meetingRooms.${index}.name`)} className="input input-bordered w-full" />
                        <input type="number" placeholder="Places" {...register(`meetingRooms.${index}.numberMettingPlace`, { valueAsNumber: true })} className="input input-bordered w-32" />
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register(`meetingRooms.${index}.isReservable`)} className="checkbox" />
                            <span>Réservable</span>
                        </label>
                        <button type="button" onClick={() => remove(index)} className="btn btn-sm btn-error">Suppr</button>
                    </div>
                ))}
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
