import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import { FormField } from './component/FormField.tsx';
import type { CreateReservationRequest } from '../api/reservation/dto/dto.ts';
import { createReservationSchema } from '../api/reservation/dto/dto.ts';
import {
    useCreateReservation,
    useRestaurantAvailability,
} from '../api/reservation/hook/hook.ts';

export const CreateReservationPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRestaurant, setSelectedRestaurant] = useState('');

    const createMutation = useCreateReservation();
    const { data: availability } = useRestaurantAvailability(selectedRestaurant);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<CreateReservationRequest>({
        resolver: zodResolver(createReservationSchema),
        defaultValues: {
            type: 'RESTAURANT_FULL',
            numberOfPeople: 1
        }
    });

    const watchedType = watch('type');

    const onSubmit = async (data: CreateReservationRequest) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success('Réservation créée avec succès !');
            navigate('/reservations');
        } catch (error) {
            toast.error('Erreur lors de la création de la réservation');
        }
    };

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100">
            <Navbar />

            <main className="container mx-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-base-content">Nouvelle Réservation</h1>
                        <a href="/reservations" className="btn btn-ghost">
                            ← Retour
                        </a>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Type de réservation */}
                                <FormField label="Type de réservation" error={errors.type?.message}>
                                    <div className="flex gap-4">
                                        <label className="label cursor-pointer">
                                            <input
                                                type="radio"
                                                value="RESTAURANT_FULL"
                                                {...register('type')}
                                                className="radio radio-primary"
                                            />
                                            <span className="label-text ml-2">Restaurant complet</span>
                                        </label>
                                        <label className="label cursor-pointer">
                                            <input
                                                type="radio"
                                                value="MEETING_ROOM"
                                                {...register('type')}
                                                className="radio radio-primary"
                                            />
                                            <span className="label-text ml-2">Salle de réunion</span>
                                        </label>
                                    </div>
                                </FormField>

                                {/* Restaurant */}
                                <FormField label="Restaurant" error={errors.restaurantId?.message}>
                                    <select
                                        {...register('restaurantId')}
                                        className="select select-bordered w-full"
                                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                                    >
                                        <option value="">Sélectionnez un restaurant</option>
                                        {/* Remplacez par vos vraies données */}
                                        <option value="restaurant-1">Restaurant Exemple 1</option>
                                        <option value="restaurant-2">Restaurant Exemple 2</option>
                                    </select>
                                </FormField>

                                {/* Salle de réunion (conditionnel) */}
                                {watchedType === 'MEETING_ROOM' && availability && (
                                    <FormField label="Salle de réunion" error={errors.meetingRoomId?.message}>
                                        <select
                                            {...register('meetingRoomId')}
                                            className="select select-bordered w-full"
                                        >
                                            <option value="">Sélectionnez une salle</option>
                                            {availability.meetingRooms.map((room) => (
                                                <option key={room.id} value={room.id}>
                                                    {room.name} (Capacité: {room.capacity})
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                )}

                                {/* Dates et heures */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Date et heure de début" error={errors.startTime?.message}>
                                        <input
                                            type="datetime-local"
                                            {...register('startTime')}
                                            className="input input-bordered w-full"
                                        />
                                    </FormField>

                                    <FormField label="Date et heure de fin" error={errors.endTime?.message}>
                                        <input
                                            type="datetime-local"
                                            {...register('endTime')}
                                            className="input input-bordered w-full"
                                        />
                                    </FormField>
                                </div>

                                {/* Nombre de personnes */}
                                <FormField label="Nombre de personnes" error={errors.numberOfPeople?.message}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        {...register('numberOfPeople', { valueAsNumber: true })}
                                        className="input input-bordered w-full"
                                    />
                                </FormField>

                                {/* Client */}
                                <FormField label="Client" error={errors.customerId?.message}>
                                    <select
                                        {...register('customerId')}
                                        className="select select-bordered w-full"
                                    >
                                        <option value="">Sélectionnez un client</option>
                                        {/* Remplacez par vos vraies données */}
                                        <option value="customer-1">Jean Dupont</option>
                                        <option value="customer-2">Marie Martin</option>
                                    </select>
                                </FormField>

                                {/* Notes */}
                                <FormField label="Notes (optionnel)" error={errors.notes?.message}>
                                    <textarea
                                        {...register('notes')}
                                        className="textarea textarea-bordered w-full"
                                        placeholder="Remarques particulières, allergies, demandes spéciales..."
                                        rows={3}
                                    />
                                </FormField>

                                {/* Informations sur la disponibilité */}
                                {availability && (
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Informations du restaurant</h3>
                                        <p><strong>Nom:</strong> {availability.restaurantName}</p>
                                        <p><strong>Capacité totale:</strong> {availability.totalCapacity} personnes</p>
                                        <p><strong>Salles disponibles:</strong> {availability.meetingRooms.length}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="card-actions justify-end pt-4">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => navigate('/reservations')}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn btn-primary ${isSubmitting || createMutation.isPending ? 'loading' : ''}`}
                                        disabled={isSubmitting || createMutation.isPending}
                                    >
                                        {isSubmitting || createMutation.isPending ? 'Création...' : 'Créer la réservation'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};