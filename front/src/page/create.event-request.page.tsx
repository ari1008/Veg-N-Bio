import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import { FormField } from './component/FormField.tsx';
import { useGetAllRestaurant } from '../api/restaurant/hook/useRestaurant.ts';
import { useAllUsers } from '../api/auth/hook/hook.ts';
import { useMeetingRoomsByRestaurant, useAvailableMeetingRooms } from '../api/meettingroom/hook/hook.ts';
import {useCreateEventRequest} from "../api/event/hook/hook.ts";
import {type CreateEventRequestRequest, createEventRequestSchema} from "../api/event/dto/dto.ts";
import {EVENT_TYPE_LABELS} from "../api/event/utils.ts";

// Composant pour la saisie de dates avec raccourcis
const EventDateTimeInput = ({ label, error, value, onChange, min, placeholder }) => {
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

    // Raccourcis de dates pour événements
    const setToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        updateDateTime(today, time || '10:00');
    };

    const setNextWeek = () => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        setDate(nextWeekStr);
        updateDateTime(nextWeekStr, time || '10:00');
    };

    const setNextMonth = () => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];
        setDate(nextMonthStr);
        updateDateTime(nextMonthStr, time || '10:00');
    };

    // Raccourcis horaires spécifiques aux événements
    const timePresets = [
        { label: '9h00', value: '09:00' },
        { label: '10h00', value: '10:00' },
        { label: '14h00', value: '14:00' },
        { label: '15h00', value: '15:00' },
        { label: '18h00', value: '18:00' },
        { label: '19h00', value: '19:00' },
    ];

    const minDate = min ? new Date(min).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">
                        <span className="label-text">Date</span>
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
                        <span className="label-text">Heure</span>
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                    />
                </div>
            </div>

            {/* Raccourcis de dates */}
            <div className="bg-base-200 p-3 rounded-lg">
                <span className="text-sm font-medium text-base-content/70">Raccourcis de dates:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                    <button
                        type="button"
                        onClick={setToday}
                        className="btn btn-outline btn-xs"
                    >
                        Aujourd'hui
                    </button>
                    <button
                        type="button"
                        onClick={setNextWeek}
                        className="btn btn-outline btn-xs"
                    >
                        Semaine prochaine
                    </button>
                    <button
                        type="button"
                        onClick={setNextMonth}
                        className="btn btn-outline btn-xs"
                    >
                        Mois prochain
                    </button>
                </div>
            </div>

            {/* Raccourcis horaires */}
            {date && (
                <div className="bg-base-200 p-3 rounded-lg">
                    <span className="text-sm font-medium text-base-content/70">Heures courantes:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
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


// Composant pour suggérer une durée d'événement
const EventDurationSuggestions = ({ startTime, onDurationSelect }) => {
    if (!startTime) return null;

    const durations = [
        { label: '1h', hours: 1 },
        { label: '2h', hours: 2 },
        { label: '3h', hours: 3 },
        { label: '4h', hours: 4 },
        { label: 'Demi-journée', hours: 4 },
        { label: 'Journée complète', hours: 8 },
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
const extractEventErrorMessage = (error: any): string => {
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

    // Messages d'erreur spécifiques connus pour les événements
    const errorMessage = error?.message || error?.toString() || '';

    if (errorMessage.includes('EventConflictException')) {
        return 'Il y a un conflit avec un autre événement pour cette période';
    }
    if (errorMessage.includes('InvalidEventTimeException')) {
        return 'Les horaires de l\'événement ne sont pas valides';
    }
    if (errorMessage.includes('RestaurantUnavailableException')) {
        return 'Le restaurant n\'est pas disponible pour cette période';
    }
    if (errorMessage.includes('InsufficientCapacityException')) {
        return 'La capacité est insuffisante pour le nombre de participants demandé';
    }
    if (errorMessage.includes('UnauthorizedEventAccessException')) {
        return "Vous n'êtes pas autorisé à créer cet événement";
    }

    return 'Erreur lors de la création de la demande d\'événement. Veuillez vérifier les informations saisies.';
};

export const CreateEventRequestPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Hooks pour récupérer les données
    const createMutation = useCreateEventRequest();
    const { mutate: loadRestaurants, data: restaurants = [], isPending: loadingRestaurants } = useGetAllRestaurant();
    const { data: users = [], isLoading: loadingUsers } = useAllUsers();

    // Salles de réunion
    const { data: meetingRooms = [], isLoading: loadingMeetingRooms } = useMeetingRoomsByRestaurant(selectedRestaurant);
    const { data: availableMeetingRooms = [] } = useAvailableMeetingRooms({
        restaurantId: selectedRestaurant,
        startTime,
        endTime
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        trigger,
        formState: { errors, isSubmitting, isValid }
    } = useForm<CreateEventRequestRequest>({
        resolver: zodResolver(createEventRequestSchema),
        mode: 'onChange', // Validation en temps réel
        defaultValues: {
            numberOfPeople: 1,
            type: 'AUTRE'
        }
    });

    // Charger les restaurants au démarrage
    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    // Surveiller les changements
    const watchedType = watch('type');
    const watchedTitle = watch('title');
    const watchedStartTime = watch('startTime');
    const watchedEndTime = watch('endTime');
    const watchedCustomerId = watch('customerId');
    const watchedRestaurantId = watch('restaurantId');
    const watchedMeetingRoomId = watch('meetingRoomId');
    const watchedNumberOfPeople = watch('numberOfPeople');
    const watchedDescription = watch('description');
    const watchedSpecialRequests = watch('specialRequests');

    // Mettre à jour les états locaux quand les valeurs changent
    useEffect(() => {
        if (watchedStartTime !== startTime) {
            setStartTime(watchedStartTime || '');
        }
    }, [watchedStartTime]);

    useEffect(() => {
        if (watchedEndTime !== endTime) {
            setEndTime(watchedEndTime || '');
        }
    }, [watchedEndTime]);

    // Validation en temps réel des champs liés
    useEffect(() => {
        if (watchedStartTime && watchedEndTime) {
            trigger(['startTime', 'endTime']);
        }
    }, [watchedStartTime, watchedEndTime, trigger]);

    // Données du restaurant sélectionné
    const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

    // Validation de la capacité
    useEffect(() => {
        if (watchedNumberOfPeople && selectedRestaurantData) {
            const maxCapacity = watchedMeetingRoomId
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
    }, [watchedNumberOfPeople, watchedMeetingRoomId, selectedRestaurantData, meetingRooms, setError, clearErrors]);

    const onSubmit = async (data: CreateEventRequestRequest) => {
        try {
            // Validation supplémentaire côté client
            if (!data.title || data.title.trim() === '') {
                setError('title', {
                    type: 'manual',
                    message: 'Le titre de l\'événement est requis'
                });
                return;
            }

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

            if (!data.description || data.description.trim() === '') {
                setError('description', {
                    type: 'manual',
                    message: 'La description de l\'événement est requise'
                });
                return;
            }

            // Nettoyer les données comme pour les réservations
            const cleanData = {
                ...data,
                title: data.title.trim(),
                description: data.description.trim(),
                specialRequests: data.specialRequests?.trim() || undefined,
                contactPhone: data.contactPhone?.trim() || undefined,
                meetingRoomId: data.meetingRoomId === '' ? undefined : data.meetingRoomId,
                startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
                endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined
            };

            console.log('Données de demande d\'événement à envoyer:', cleanData);

            await createMutation.mutateAsync(cleanData);
            toast.success('Demande d\'événement créée avec succès !');
            navigate('/event-requests');
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            const errorMessage = extractEventErrorMessage(error);
            toast.error(errorMessage);

            // Gestion spécifique des erreurs de validation côté serveur
            if (error?.response?.status === 400 && error?.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                Object.entries(serverErrors).forEach(([field, message]) => {
                    setError(field as keyof CreateEventRequestRequest, {
                        type: 'server',
                        message: message as string
                    });
                });
            }
        }
    };

    // Si une salle spécifique est demandée, afficher les salles disponibles
    const needsSpecificRoom = watch('meetingRoomId');
    const roomsToDisplay = needsSpecificRoom && startTime && endTime
        ? availableMeetingRooms
        : meetingRooms;

    // Vérification si le formulaire peut être soumis
    const canSubmit = !isSubmitting &&
        !createMutation.isPending &&
        watchedTitle &&
        watchedCustomerId &&
        watchedRestaurantId &&
        watchedStartTime &&
        watchedEndTime &&
        watchedDescription &&
        watchedNumberOfPeople > 0;

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100">
            <Navbar />

            <main className="container mx-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-base-content">Nouvelle Demande d'Événement</h1>
                        <a href="/event-requests" className="btn btn-ghost">
                            ← Retour
                        </a>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                                {/* Messages d'erreur global */}
                                {createMutation.isError && (
                                    <div className="alert alert-error">
                                        <span>{extractEventErrorMessage(createMutation.error)}</span>
                                    </div>
                                )}

                                {/* Type d'événement */}
                                <FormField label="Type d'événement *" error={errors.type?.message}>
                                    <select
                                        {...register('type')}
                                        className={`select select-bordered w-full ${errors.type ? 'select-error' : ''}`}
                                    >
                                        {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </FormField>

                                {/* Titre de l'événement */}
                                <FormField label="Titre de l'événement *" error={errors.title?.message}>
                                    <input
                                        type="text"
                                        {...register('title')}
                                        className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                                        placeholder="Ex: Anniversaire de Sophie, Conférence Marketing, etc."
                                        onBlur={() => trigger('title')}
                                    />
                                    <div className="text-sm text-base-content/50 mt-1">
                                        {watchedTitle?.length || 0}/100 caractères
                                    </div>
                                </FormField>

                                {/* Restaurant */}
                                <FormField label="Restaurant *" error={errors.restaurantId?.message}>
                                    {loadingRestaurants ? (
                                        <div className="skeleton h-12 w-full"></div>
                                    ) : (
                                        <select
                                            {...register('restaurantId')}
                                            onChange={(e) => {
                                                setSelectedRestaurant(e.target.value);
                                                register('restaurantId').onChange(e);
                                                // Reset de la salle si on change de restaurant
                                                setValue('meetingRoomId', '');
                                                clearErrors('restaurantId');
                                            }}
                                            className={`select select-bordered w-full ${errors.restaurantId ? 'select-error' : ''}`}
                                        >
                                            <option value="">Sélectionner un restaurant</option>
                                            {restaurants.map((restaurant) => (
                                                <option key={restaurant.id} value={restaurant.id}>
                                                    {restaurant.name} - {restaurant.address.city}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </FormField>

                                {/* Date et heure de début */}
                                <FormField label="Date et heure de début *" error={errors.startTime?.message}>
                                    <EventDateTimeInput
                                        label="Début de l'événement"
                                        value={watchedStartTime}
                                        onChange={(value) => {
                                            setValue('startTime', value);
                                            clearErrors('startTime');
                                        }}
                                        error={errors.startTime?.message}
                                        min={new Date().toISOString()}
                                        placeholder="Date et heure de début"
                                    />
                                </FormField>

                                {/* Suggestions de durée */}
                                {watchedStartTime && (
                                    <EventDurationSuggestions
                                        startTime={watchedStartTime}
                                        onDurationSelect={(endTime) => {
                                            setValue('endTime', endTime);
                                            clearErrors('endTime');
                                        }}
                                    />
                                )}

                                {/* Date et heure de fin */}
                                <FormField label="Date et heure de fin *" error={errors.endTime?.message}>
                                    <EventDateTimeInput
                                        label="Fin de l'événement"
                                        value={watchedEndTime}
                                        onChange={(value) => {
                                            setValue('endTime', value);
                                            clearErrors('endTime');
                                        }}
                                        error={errors.endTime?.message}
                                        min={watchedStartTime}
                                        placeholder="Date et heure de fin"
                                    />
                                </FormField>

                                {/* Récapitulatif de l'événement */}
                                {watchedStartTime && watchedEndTime && (
                                    <div className="alert alert-info">
                                        <div>
                                            <h4 className="font-bold">Récapitulatif de l'événement</h4>
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

                                {/* Salle de réunion (optionnelle) */}
                                {selectedRestaurant && meetingRooms.length > 0 && (
                                    <FormField label="Salle spécifique (optionnel)" error={errors.meetingRoomId?.message}>
                                        {loadingMeetingRooms ? (
                                            <div className="skeleton h-12 w-full"></div>
                                        ) : (
                                            <>
                                                <select
                                                    {...register('meetingRoomId')}
                                                    className={`select select-bordered w-full ${errors.meetingRoomId ? 'select-error' : ''}`}
                                                >
                                                    <option value="">Aucune salle spécifique</option>
                                                    {roomsToDisplay.map((room) => (
                                                        <option key={room.id} value={room.id}>
                                                            {room.name} - {room.numberMettingPlace} places
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Affichage de la disponibilité */}
                                                {needsSpecificRoom && startTime && endTime && (
                                                    <div className="mt-2">
                                                        <div className="text-sm font-medium mb-2">Disponibilité des salles:</div>
                                                        <div className="grid gap-2">
                                                            {meetingRooms.map((room) => {
                                                                const isAvailable = availableMeetingRooms.some(ar => ar.id === room.id);
                                                                return (
                                                                    <div key={room.id} className="flex justify-between items-center p-2 bg-base-200 rounded">
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

                                {/* Nombre de participants */}
                                <FormField label="Nombre de participants *" error={errors.numberOfPeople?.message}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        {...register('numberOfPeople', { valueAsNumber: true })}
                                        className={`input input-bordered w-full ${errors.numberOfPeople ? 'input-error' : ''}`}
                                        onBlur={() => trigger('numberOfPeople')}
                                    />
                                    {selectedRestaurantData && (
                                        <div className="text-sm text-base-content/70 mt-1">
                                            Capacité maximale: {watchedMeetingRoomId
                                            ? meetingRooms.find(room => room.id === watchedMeetingRoomId)?.numberMettingPlace || 0
                                            : selectedRestaurantData.numberPlace} personnes
                                        </div>
                                    )}
                                </FormField>

                                {/* Client */}
                                <FormField label="Client *" error={errors.customerId?.message}>
                                    {loadingUsers ? (
                                        <div className="skeleton h-12 w-full"></div>
                                    ) : (
                                        <select
                                            {...register('customerId')}
                                            className={`select select-bordered w-full ${errors.customerId ? 'select-error' : ''}`}
                                        >
                                            <option value="">Sélectionner un client</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.firstName} {user.lastName} - {user.email}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </FormField>

                                {/* Téléphone de contact */}
                                <FormField label="Téléphone de contact (optionnel)" error={errors.contactPhone?.message}>
                                    <input
                                        type="tel"
                                        {...register('contactPhone')}
                                        className={`input input-bordered w-full ${errors.contactPhone ? 'input-error' : ''}`}
                                        placeholder="06 12 34 56 78"
                                        onBlur={() => trigger('contactPhone')}
                                    />
                                </FormField>

                                {/* Description */}
                                <FormField label="Description de l'événement *" error={errors.description?.message}>
                                    <textarea
                                        {...register('description')}
                                        className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
                                        placeholder="Décrivez l'événement, l'ambiance souhaitée, le déroulement prévu..."
                                        rows={4}
                                        onBlur={() => trigger('description')}
                                    />
                                    <div className="text-sm text-base-content/50 mt-1">
                                        {watchedDescription?.length || 0}/1000 caractères
                                    </div>
                                </FormField>

                                {/* Demandes spéciales */}
                                <FormField label="Demandes spéciales (optionnel)" error={errors.specialRequests?.message}>
                                    <textarea
                                        {...register('specialRequests')}
                                        className={`textarea textarea-bordered w-full ${errors.specialRequests ? 'textarea-error' : ''}`}
                                        placeholder="Décoration, animation, allergies, matériel spécifique, restrictions alimentaires..."
                                        rows={3}
                                        onBlur={() => trigger('specialRequests')}
                                    />
                                    <div className="text-sm text-base-content/50 mt-1">
                                        {watchedSpecialRequests?.length || 0}/500 caractères
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
                                                        <span key={index} className="badge badge-outline badge-sm">
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

                                {selectedRestaurant && meetingRooms.length === 0 && !loadingMeetingRooms && (
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
                                    <h4 className="font-semibold mb-2">État de la demande</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={!!watchedType}
                                                readOnly
                                            />
                                            <span className={`text-sm ${watchedType ? 'text-success' : 'text-base-content/60'}`}>
                                                Type d'événement sélectionné
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={!!watchedTitle && watchedTitle.trim() !== ''}
                                                readOnly
                                            />
                                            <span className={`text-sm ${watchedTitle?.trim() ? 'text-success' : 'text-base-content/60'}`}>
                                                Titre renseigné
                                            </span>
                                        </div>
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
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={!!watchedDescription && watchedDescription.trim() !== ''}
                                                readOnly
                                            />
                                            <span className={`text-sm ${watchedDescription?.trim() ? 'text-success' : 'text-base-content/60'}`}>
                                                Description renseignée
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={!!watchedNumberOfPeople && watchedNumberOfPeople > 0}
                                                readOnly
                                            />
                                            <span className={`text-sm ${watchedNumberOfPeople > 0 ? 'text-success' : 'text-base-content/60'}`}>
                                                Nombre de participants défini
                                            </span>
                                        </div>
                                    </div>

                                    {!canSubmit && (
                                        <div className="mt-3 text-sm text-warning">
                                            <span className="font-medium">Attention:</span> Veuillez compléter tous les champs obligatoires (*) pour pouvoir créer la demande d'événement.
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="card-actions justify-end pt-4">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => navigate('/event-requests')}
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
                                            'Créer la demande'
                                        )}
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