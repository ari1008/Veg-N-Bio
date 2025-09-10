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
import { useAllUsers } from '../api/auth/hook/hook.ts';

// Composant pour la saisie de dates améliorée
const DateTimeInput = ({ label, error, value, onChange, min, placeholder }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Extraire date et heure du datetime-local
    useEffect(() => {
        if (value) {
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
                setDate(dateObj.toISOString().split('T')[0]);
                setTime(dateObj.toTimeString().slice(0, 5));
            }
        }
    }, [value]);

    // Mettre à jour la valeur combinée
    const updateDateTime = (newDate, newTime) => {
        if (newDate && newTime) {
            const combined = `${newDate}T${newTime}`;
            onChange(combined);
        } else {
            onChange('');
        }
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        updateDateTime(newDate, time);
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTime(newTime);
        updateDateTime(date, newTime);
    };

    // Raccourcis pour les dates courantes
    const setToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        updateDateTime(today, time || '09:00');
    };

    const setTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        setDate(tomorrowStr);
        updateDateTime(tomorrowStr, time || '09:00');
    };

    const setNextWeek = () => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        setDate(nextWeekStr);
        updateDateTime(nextWeekStr, time || '09:00');
    };

    // Raccourcis pour les heures courantes
    const timePresets = [
        { label: '9h00', value: '09:00' },
        { label: '12h00', value: '12:00' },
        { label: '14h00', value: '14:00' },
        { label: '17h00', value: '17:00' },
        { label: '19h00', value: '19:00' },
    ];

    const minDate = min ? new Date(min).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-3">
            <label className="label">
                <span className="label-text font-medium">{label}</span>
            </label>

            {/* Raccourcis de dates */}
            <div className="flex flex-wrap gap-2 mb-3">
                <button
                    type="button"
                    onClick={setToday}
                    className="btn btn-outline btn-xs"
                >
                    Aujourd'hui
                </button>
                <button
                    type="button"
                    onClick={setTomorrow}
                    className="btn btn-outline btn-xs"
                >
                    Demain
                </button>
                <button
                    type="button"
                    onClick={setNextWeek}
                    className="btn btn-outline btn-xs"
                >
                    Semaine prochaine
                </button>
            </div>

            {/* Saisie de date et heure séparées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="label">
                        <span className="label-text text-sm">Date</span>
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        min={minDate}
                        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text text-sm">Heure</span>
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                    />
                </div>
            </div>

            {/* Raccourcis d'heures */}
            {date && (
                <div className="flex flex-wrap gap-2">
                    {timePresets.map((preset) => (
                        <button
                            key={preset.value}
                            type="button"
                            onClick={() => {
                                setTime(preset.value);
                                updateDateTime(date, preset.value);
                            }}
                            className={`btn btn-outline btn-xs ${time === preset.value ? 'btn-active' : ''}`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Affichage de la date/heure combinée */}
            {date && time && (
                <div className="text-sm text-base-content/70 mt-2">
                    <span className="font-medium">Sélectionné:</span> {
                    new Date(`${date}T${time}`).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }
                </div>
            )}

            {error && (
                <div className="text-error text-sm mt-1">{error}</div>
            )}
        </div>
    );
};

// Composant pour suggérer une durée
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

// Fonction pour extraire les messages d'erreur détaillés
const extractErrorMessage = (error: any): string => {
    // Si c'est une erreur de réponse HTTP avec détails
    if (error?.response?.data) {
        const errorData = error.response.data;

        // Si c'est un objet d'erreur structuré
        if (errorData.message) {
            return errorData.message;
        }

        // Si c'est un objet avec des erreurs de validation détaillées
        if (errorData.errors && typeof errorData.errors === 'object') {
            const errorMessages = Object.values(errorData.errors).join(', ');
            return `Erreurs de validation: ${errorMessages}`;
        }

        // Si c'est un string direct
        if (typeof errorData === 'string') {
            return errorData;
        }
    }

    // Messages d'erreur spécifiques connus
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
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Hooks pour récupérer les données
    const createMutation = useCreateReservation();
    const { data: availability } = useRestaurantAvailability(selectedRestaurant);
    const { mutate: loadRestaurants, data: restaurants = [], isPending: loadingRestaurants } = useGetAllRestaurant();
    const { data: users = [], isLoading: loadingUsers } = useAllUsers();

    // Utilisation temporaire des salles du restaurant
    const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);
    const meetingRooms = selectedRestaurantData?.meetingRooms || [];
    const loadingMeetingRooms = false;
    const availableMeetingRooms = meetingRooms;
    const loadingAvailability = false;

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

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
        mode: 'onChange', // Validation en temps réel
        defaultValues: {
            type: 'RESTAURANT_FULL',
            numberOfPeople: 1
        }
    });

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

    // Validation en temps réel des champs liés
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

    // Validation de la capacité
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
            // Validation supplémentaire côté client
            if (!data.customerId || data.customerId === '') {
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

            // Nettoyer les données avant envoi
            const cleanData = {
                ...data,
                customerId: data.customerId === '' ? undefined : data.customerId,
                meetingRoomId: data.meetingRoomId === '' ? undefined : data.meetingRoomId,
                startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
                endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined
            };

            console.log('Données nettoyées à envoyer:', cleanData);

            await createMutation.mutateAsync(cleanData);
            toast.success('Réservation créée avec succès !');
            navigate('/reservations');
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            const errorMessage = extractErrorMessage(error);
            toast.error(errorMessage);

            // Gestion spécifique des erreurs de validation côté serveur
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

    // Vérification si le formulaire peut être soumis
    const canSubmit = !isSubmitting &&
        !createMutation.isPending &&
        watchedCustomerId &&
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

                                {/* Client */}
                                <FormField label="Client *" error={errors.customerId?.message}>
                                    {loadingUsers ? (
                                        <div className="flex items-center justify-center p-4">
                                            <span className="loading loading-spinner loading-md"></span>
                                            <span className="ml-2">Chargement des clients...</span>
                                        </div>
                                    ) : (
                                        <select
                                            {...register('customerId')}
                                            className={`select select-bordered w-full ${errors.customerId ? 'select-error' : ''}`}
                                        >
                                            <option value="">Sélectionnez un client</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.fullName} - {user.email}
                                                </option>
                                            ))}
                                        </select>
                                    )}
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

                                {users.length === 0 && !loadingUsers && (
                                    <div className="alert alert-warning">
                                        <span>Aucun client disponible pour le moment.</span>
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
                                                checked={!!watchedCustomerId}
                                                readOnly
                                            />
                                            <span className={`text-sm ${watchedCustomerId ? 'text-success' : 'text-base-content/60'}`}>
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