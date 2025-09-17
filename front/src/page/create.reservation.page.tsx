import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import { FormField } from './component/FormField.tsx';
import type { CreateReservationRequest } from '../api/reservation/dto/dto.ts';
import { createReservationSchema } from '../api/reservation/dto/dto.ts';
import { useCreateReservation, useRestaurantAvailability } from '../api/reservation/hook/hook.ts';
import { useGetAllRestaurant } from '../api/restaurant/hook/useRestaurant.ts';
import { useUserSearch } from '../api/auth/hook/hook.ts';
import {DateTimeInput} from "./component/DateTimeInput.component.tsx";
import type {UserSummary} from "../api/auth/dto/dto.ts";


const DurationSuggestions = ({ startTime, onDurationSelect }) => {
    if (!startTime) return null;

    const durations = [
        { label: '1h', hours: 1 },
        { label: '1h30', hours: 1.5 },
        { label: '2h', hours: 2 },
        { label: '3h', hours: 3 },
        { label: '4h', hours: 4 },
        { label: 'Journée', hours: 8 },
    ];

    const calculateEndTime = (hours) => {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
        return end.toISOString().slice(0, 16);
    };

    return (
        <div className="bg-base-200 p-3 rounded-lg">
            <span className="text-sm font-medium text-base-content/70">Durée suggérée:</span>
            <div className="flex flex-wrap gap-2 mt-2">
                {durations.map((duration) => (
                    <button
                        key={duration.label}
                        type="button"
                        onClick={() => onDurationSelect(calculateEndTime(duration.hours))}
                        className="btn btn-outline btn-xs"
                    >
                        {duration.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const extractErrorMessage = (error: any): string => {
    if (error?.response?.data) {
        const errorData = error.response.data;

        if (errorData.message) {
            return errorData.message;
        }

        if (errorData.errors && typeof errorData.errors === 'object') {
            const errorMessages = Object.values(errorData.errors).join(', ');
            return `Erreurs de validation: ${errorMessages}`;
        }

        if (typeof errorData === 'string') {
            return errorData;
        }
    }

    const errorMessage = error?.message || error?.toString() || '';

    if (errorMessage.includes('InsufficientCapacityException')) {
        return 'La capacité du restaurant/salle est insuffisante pour le nombre de personnes demandé';
    }
    if (errorMessage.includes('ReservationConflictException')) {
        return 'Il y a un conflit avec une autre réservation pour cette période';
    }
    if (errorMessage.includes('InvalidReservationTimeException')) {
        return 'Les horaires de réservation ne sont pas valides';
    }
    if (errorMessage.includes('RestaurantClosedException')) {
        return 'Le restaurant est fermé à cette période';
    }
    if (errorMessage.includes('UnauthorizedReservationAccessException')) {
        return "Vous n'êtes pas autorisé à effectuer cette réservation";
    }

    return 'Erreur lors de la création de la réservation. Veuillez vérifier les informations saisies.';
};

export const CreateReservationPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const createMutation = useCreateReservation();
    const { data: availability } = useRestaurantAvailability(selectedRestaurant);
    const { mutate: loadRestaurants, data: restaurants = [], isPending: loadingRestaurants } = useGetAllRestaurant();
    const { users, isLoading: loadingUsers, searchTerm, setSearchTerm, hasSearchTerm } = useUserSearch(20);

    const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);
    const meetingRooms = selectedRestaurantData?.meetingRooms || [];
    const loadingMeetingRooms = false;
    const availableMeetingRooms = meetingRooms;
    const loadingAvailability = false;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        trigger,
        formState: { errors, isSubmitting, isValid }
    } = useForm<CreateReservationRequest>({
        resolver: zodResolver(createReservationSchema),
        mode: 'onChange',
        defaultValues: {
            type: 'RESTAURANT_FULL',
            numberOfPeople: 1,
            customerId: ''
        }
    });

    // Mettre à jour le formulaire quand un utilisateur est sélectionné
    useEffect(() => {
        if (selectedUser) {
            setValue('customerId', selectedUser.id);
            clearErrors('customerId');
        } else {
            setValue('customerId', '');
        }
    }, [selectedUser, setValue, clearErrors]);

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    const watchedType = watch('type');
    const watchedStartTime = watch('startTime');
    const watchedEndTime = watch('endTime');
    const watchedCustomerId = watch('customerId');
    const watchedRestaurantId = watch('restaurantId');
    const watchedMeetingRoomId = watch('meetingRoomId');
    const watchedNumberOfPeople = watch('numberOfPeople');

    useEffect(() => {
        if (watchedStartTime) setStartTime(watchedStartTime);
    }, [watchedStartTime]);

    useEffect(() => {
        if (watchedEndTime) setEndTime(watchedEndTime);
    }, [watchedEndTime]);

    useEffect(() => {
        setValue('meetingRoomId', '');
        clearErrors('meetingRoomId');
    }, [selectedRestaurant, setValue, clearErrors]);

    useEffect(() => {
        if (watchedStartTime && watchedEndTime) {
            trigger(['startTime', 'endTime']);
        }
    }, [watchedStartTime, watchedEndTime, trigger]);

    useEffect(() => {
        if (watchedType === 'MEETING_ROOM' && watchedMeetingRoomId) {
            trigger('meetingRoomId');
        }
    }, [watchedType, watchedMeetingRoomId, trigger]);

    useEffect(() => {
        if (watchedNumberOfPeople && selectedRestaurantData) {
            const maxCapacity = watchedType === 'MEETING_ROOM' && watchedMeetingRoomId
                ? meetingRooms.find(room => room.id === watchedMeetingRoomId)?.numberMettingPlace || 0
                : selectedRestaurantData.numberPlace;

            if (watchedNumberOfPeople > maxCapacity) {
                setError('numberOfPeople', {
                    type: 'manual',
                    message: `La capacité maximale est de ${maxCapacity} personnes`
                });
            } else {
                clearErrors('numberOfPeople');
            }
        }
    }, [watchedNumberOfPeople, watchedType, watchedMeetingRoomId, selectedRestaurantData, meetingRooms, setError, clearErrors]);

    const onSubmit = async (data: CreateReservationRequest) => {
        try {
            if (!selectedUser) {
                setError('customerId', {
                    type: 'manual',
                    message: 'Veuillez sélectionner un client'
                });
                return;
            }

            if (!data.restaurantId || data.restaurantId === '') {
                setError('restaurantId', {
                    type: 'manual',
                    message: 'Veuillez sélectionner un restaurant'
                });
                return;
            }

            if (data.type === 'MEETING_ROOM' && (!data.meetingRoomId || data.meetingRoomId === '')) {
                setError('meetingRoomId', {
                    type: 'manual',
                    message: 'Veuillez sélectionner une salle de réunion'
                });
                return;
            }

            const cleanData = {
                ...data,
                customerId: selectedUser.id,
                meetingRoomId: data.meetingRoomId === '' ? undefined : data.meetingRoomId,
                startTime: data.startTime ? (data.startTime.includes(':00') ? data.startTime : `${data.startTime}:00`) : undefined,
                endTime: data.endTime ? (data.endTime.includes(':00') ? data.endTime : `${data.endTime}:00`) : undefined
            };

            console.log('Données nettoyées à envoyer:', cleanData);

            await createMutation.mutateAsync(cleanData);
            toast.success('Réservation créée avec succès !');
            navigate('/reservations');
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);

            if (error?.response?.status === 400 && error?.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                Object.entries(serverErrors).forEach(([field, message]) => {
                    setError(field as keyof CreateReservationRequest, {
                        type: 'server',
                        message: message as string
                    });
                });
            }
        }
    };

    const roomsToDisplay = watchedType === 'MEETING_ROOM' && startTime && endTime
        ? availableMeetingRooms
        : meetingRooms;

    const canSubmit = !isSubmitting &&
        !createMutation.isPending &&
        selectedUser &&
        watchedRestaurantId &&
        watchedStartTime &&
        watchedEndTime &&
        (watchedType !== 'MEETING_ROOM' || watchedMeetingRoomId);

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
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                                {/* Messages d'erreur global */}
                                {createMutation.isError && (
                                    <div className="alert alert-error">
                                        <span>{extractErrorMessage(createMutation.error)}</span>
                                    </div>
                                )}

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
                                <FormField label="Restaurant *" error={errors.restaurantId?.message}>
                                    {loadingRestaurants ? (
                                        <div className="flex items-center justify-center p-4">
                                            <span className="loading loading-spinner loading-md"></span>
                                            <span className="ml-2">Chargement des restaurants...</span>
                                        </div>
                                    ) : (
                                        <select
                                            {...register('restaurantId')}
                                            className={`select select-bordered w-full ${errors.restaurantId ? 'select-error' : ''}`}
                                            onChange={(e) => {
                                                register('restaurantId').onChange(e);
                                                setSelectedRestaurant(e.target.value);
                                                clearErrors('restaurantId');
                                            }}
                                        >
                                            <option value="">Sélectionnez un restaurant</option>
                                            {restaurants.map((restaurant) => (
                                                <option key={restaurant.id} value={restaurant.id}>
                                                    {restaurant.name} - {restaurant.address.city}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </FormField>

                                {/* Dates et heures améliorées */}
                                <div className="space-y-4">
                                    <DateTimeInput
                                        label="Date et heure de début *"
                                        value={watchedStartTime}
                                        onChange={(value) => {
                                            setValue('startTime', value);
                                            clearErrors('startTime');
                                        }}
                                        min={new Date().toISOString().slice(0, 16)}
                                        error={errors.startTime?.message}
                                    />

                                    <DurationSuggestions
                                        startTime={watchedStartTime}
                                        onDurationSelect={(endTime) => {
                                            setValue('endTime', endTime);
                                            clearErrors('endTime');
                                        }}
                                    />

                                    <DateTimeInput
                                        label="Date et heure de fin *"
                                        value={watchedEndTime}
                                        onChange={(value) => {
                                            setValue('endTime', value);
                                            clearErrors('endTime');
                                        }}
                                        min={watchedStartTime}
                                        error={errors.endTime?.message}
                                    />

                                    {/* Récapitulatif de la réservation */}
                                    {watchedStartTime && watchedEndTime && (
                                        <div className="alert alert-info">
                                            <div>
                                                <h4 className="font-bold">Récapitulatif</h4>
                                                <div className="text-sm">
                                                    <p>Du: {new Date(watchedStartTime).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</p>
                                                    <p>Au: {new Date(watchedEndTime).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</p>
                                                    <p className="font-medium">
                                                        Durée: {Math.round((new Date(watchedEndTime) - new Date(watchedStartTime)) / (1000 * 60 * 60 * 10)) / 10}h
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Salle de réunion (conditionnel) */}
                                {watchedType === 'MEETING_ROOM' && selectedRestaurant && (
                                    <FormField label="Salle de réunion *" error={errors.meetingRoomId?.message}>
                                        {loadingMeetingRooms || loadingAvailability ? (
                                            <div className="flex items-center justify-center p-4">
                                                <span className="loading loading-spinner loading-md"></span>
                                                <span className="ml-2">
                                                    {loadingAvailability ? 'Vérification de la disponibilité...' : 'Chargement des salles...'}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <select
                                                    {...register('meetingRoomId')}
                                                    className={`select select-bordered w-full ${errors.meetingRoomId ? 'select-error' : ''}`}
                                                >
                                                    <option value="">Sélectionnez une salle</option>
                                                    {roomsToDisplay.map((room) => (
                                                        <option key={room.id || room.name} value={room.id}>
                                                            {room.name} (Capacité: {room.numberMettingPlace} personnes)
                                                            {!room.isReservable && ' - Non réservable'}
                                                        </option>
                                                    ))}
                                                </select>

                                                {startTime && endTime && (
                                                    <div className="mt-2">
                                                        {availableMeetingRooms.length === 0 ? (
                                                            <div className="alert alert-warning">
                                                                <span>Aucune salle disponible pour cette période</span>
                                                            </div>
                                                        ) : (
                                                            <div className="alert alert-success">
                                                                <span>{availableMeetingRooms.length} salle(s) disponible(s)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {meetingRooms.length > 0 && startTime && endTime && (
                                                    <div className="mt-4 p-3 bg-base-200 rounded-lg">
                                                        <h4 className="font-semibold mb-2">État des salles :</h4>
                                                        <div className="space-y-1">
                                                            {meetingRooms.map((room) => {
                                                                const isAvailable = availableMeetingRooms.some(ar => ar.id === room.id);
                                                                return (
                                                                    <div key={room.id || room.name} className="flex justify-between items-center text-sm">
                                                                        <span>{room.name}</span>
                                                                        <span className={`badge ${isAvailable ? 'badge-success' : 'badge-error'}`}>
                                                                            {isAvailable ? 'Disponible' : 'Occupée'}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </FormField>
                                )}

                                {/* Nombre de personnes */}
                                <FormField label="Nombre de personnes *" error={errors.numberOfPeople?.message}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        {...register('numberOfPeople', { valueAsNumber: true })}
                                        className={`input input-bordered w-full ${errors.numberOfPeople ? 'input-error' : ''}`}
                                        onBlur={() => trigger('numberOfPeople')}
                                    />
                                    {selectedRestaurantData && (
                                        <div className="text-sm text-base-content/70 mt-1">
                                            Capacité maximale: {watchedType === 'MEETING_ROOM' && watchedMeetingRoomId
                                            ? meetingRooms.find(room => room.id === watchedMeetingRoomId)?.numberMettingPlace || 0
                                            : selectedRestaurantData.numberPlace} personnes
                                        </div>
                                    )}
                                </FormField>

                                {/* Client avec barre de recherche */}
                                <FormField label="Client *" error={errors.customerId?.message}>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Rechercher par nom ou email..."
                                            className="input input-bordered w-full"
                                        />

                                        {loadingUsers ? (
                                            <div className="flex justify-center py-4">
                                                <span className="loading loading-spinner loading-md"></span>
                                            </div>
                                        ) : (
                                            <div className="max-h-60 overflow-y-auto space-y-2">
                                                {users.length === 0 ? (
                                                    <div className="text-center py-8 text-base-content/50">
                                                        {hasSearchTerm ?
                                                            `Aucun client trouvé pour "${searchTerm}"` :
                                                            "Tapez pour rechercher un client"
                                                        }
                                                    </div>
                                                ) : (
                                                    users.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                clearErrors('customerId');
                                                            }}
                                                            className={`card bg-base-200 shadow cursor-pointer transition-colors ${
                                                                selectedUser?.id === user.id ?
                                                                    'bg-primary text-primary-content' :
                                                                    'hover:bg-base-300'
                                                            }`}
                                                        >
                                                            <div className="card-body p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="avatar placeholder">
                                                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                                            <span className="text-xl">{user.fullName.charAt(0)}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold">{user.fullName}</div>
                                                                        <div className="text-sm opacity-70">{user.email}</div>
                                                                    </div>
                                                                    {selectedUser?.id === user.id && (
                                                                        <div className="ml-auto">
                                                                            <span className="text-2xl">✓</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {selectedUser && (
                                            <div className="alert alert-success">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-2">
                                                        <span>✓</span>
                                                        <span>Client sélectionné : <strong>{selectedUser.fullName}</strong></span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedUser(null);
                                                            setSearchTerm('');
                                                        }}
                                                        className="btn btn-ghost btn-xs"
                                                    >
                                                        Changer
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </FormField>

                                {/* Notes */}
                                <FormField label="Notes (optionnel)" error={errors.notes?.message}>
                                    <textarea
                                        {...register('notes')}
                                        className={`textarea textarea-bordered w-full ${errors.notes ? 'textarea-error' : ''}`}
                                        placeholder="Remarques particulières, allergies, demandes spéciales..."
                                        rows={3}
                                        maxLength={1000}
                                    />
                                    <div className="text-sm text-base-content/50 mt-1">
                                        {watch('notes')?.length || 0}/1000 caractères
                                    </div>
                                </FormField>

                                {/* Informations sur le restaurant sélectionné */}
                                {selectedRestaurantData && (
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Informations du restaurant</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            <p><strong>Nom:</strong> {selectedRestaurantData.name}</p>
                                            <p><strong>Ville:</strong> {selectedRestaurantData.address.city}</p>
                                            <p><strong>Capacité totale:</strong> {selectedRestaurantData.numberPlace} personnes</p>
                                            <p><strong>Salles de réunion:</strong> {meetingRooms.length}</p>
                                        </div>

                                        {selectedRestaurantData.restaurantFeatures.length > 0 && (
                                            <div className="mt-3">
                                                <strong>Caractéristiques:</strong>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedRestaurantData.restaurantFeatures.map((feature, index) => (
                                                        <span key={index} className="badge badge-outline text-xs">
                                                            {feature.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Messages d'erreur et d'avertissement */}
                                {restaurants.length === 0 && !loadingRestaurants && (
                                    <div className="alert alert-warning">
                                        <span>Aucun restaurant disponible pour le moment.</span>
                                    </div>
                                )}

                                {watchedType === 'MEETING_ROOM' && selectedRestaurant && meetingRooms.length === 0 && !loadingMeetingRooms && (
                                    <div className="alert alert-info">
                                        <span>Ce restaurant n'a pas de salles de réunion configurées.</span>
                                    </div>
                                )}

                                {/* Validation des heures */}
                                {watchedStartTime && watchedEndTime && new Date(watchedStartTime) >= new Date(watchedEndTime) && (
                                    <div className="alert alert-error">
                                        <span>L'heure de fin doit être postérieure à l'heure de début.</span>
                                    </div>
                                )}

                                {/* Indicateur de progression de validation */}
                                <div className="bg-base-200 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">État du formulaire</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={!!selectedUser}
                                                readOnly
                                            />
                                            <span className={`text-sm ${selectedUser ? 'text-success' : 'text-base-content/60'}`}>
                                                Client sélectionné
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={!!watchedRestaurantId}
                                                readOnly
                                            />
                                            <span className={`text-sm ${watchedRestaurantId ? 'text-success' : 'text-base-content/60'}`}>
                                                Restaurant sélectionné
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={!!watchedStartTime && !!watchedEndTime}
                                                readOnly
                                            />
                                            <span className={`text-sm ${watchedStartTime && watchedEndTime ? 'text-success' : 'text-base-content/60'}`}>
                                                Dates et heures définies
                                            </span>
                                        </div>
                                        {watchedType === 'MEETING_ROOM' && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-xs"
                                                    checked={!!watchedMeetingRoomId}
                                                    readOnly
                                                />
                                                <span className={`text-sm ${watchedMeetingRoomId ? 'text-success' : 'text-base-content/60'}`}>
                                                    Salle de réunion sélectionnée
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={!!watchedNumberOfPeople && watchedNumberOfPeople > 0}
                                                readOnly
                                            />
                                            <span className={`text-sm ${watchedNumberOfPeople > 0 ? 'text-success' : 'text-base-content/60'}`}>
                                                Nombre de personnes défini
                                            </span>
                                        </div>
                                    </div>

                                    {!canSubmit && (
                                        <div className="mt-3 text-sm text-warning">
                                            <span className="font-medium">Attention:</span> Veuillez compléter tous les champs obligatoires (*) pour pouvoir créer la réservation.
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="card-actions justify-end pt-4">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => navigate('/reservations')}
                                        disabled={isSubmitting || createMutation.isPending}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn btn-primary ${(isSubmitting || createMutation.isPending) ? 'loading' : ''}`}
                                        disabled={!canSubmit}
                                    >
                                        {isSubmitting || createMutation.isPending ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Création...
                                            </>
                                        ) : (
                                            'Créer la réservation'
                                        )}
                                    </button>
                                </div>

                                {/* Debug des erreurs (à retirer en production) */}
                                {Object.keys(errors).length > 0 && process.env.NODE_ENV === 'development' && (
                                    <div className="bg-error/10 p-4 rounded-lg">
                                        <h4 className="font-semibold text-error mb-2">Erreurs de validation (Debug)</h4>
                                        <pre className="text-xs overflow-auto">
                                            {JSON.stringify(errors, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};