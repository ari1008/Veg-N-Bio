import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from './component/navbar.tsx';
import Footer from './component/footer.tsx';
import { FormField } from './component/FormField.tsx';
import { useGetAllRestaurant } from '../api/restaurant/hook/useRestaurant.ts';
import { useUserSearch } from '../api/auth/hook/hook.ts';
import { useMeetingRoomsByRestaurant, useAvailableMeetingRooms } from '../api/meettingroom/hook/hook.ts';
import {useCreateEventRequest} from "../api/event/hook/hook.ts";
import {type CreateEventRequestRequest, createEventRequestSchema} from "../api/event/dto/dto.ts";
import {EVENT_TYPE_LABELS} from "../api/event/utils.ts";
import {EventDateTimeInput} from "./component/EventDateTimeInput.component.tsx";
import type {UserSummary} from "../api/auth/dto/dto.ts";


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

const extractEventErrorMessage = (error: any): string => {
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
    const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const createMutation = useCreateEventRequest();
    const { mutate: loadRestaurants, data: restaurants = [], isPending: loadingRestaurants } = useGetAllRestaurant();
    const { users, isLoading: loadingUsers, searchTerm, setSearchTerm, hasSearchTerm } = useUserSearch(20);

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
        mode: 'onChange',
        defaultValues: {
            numberOfPeople: 1,
            type: 'AUTRE',
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
    const watchedTitle = watch('title');
    const watchedStartTime = watch('startTime');
    const watchedEndTime = watch('endTime');
    const watchedRestaurantId = watch('restaurantId');
    const watchedMeetingRoomId = watch('meetingRoomId');
    const watchedNumberOfPeople = watch('numberOfPeople');
    const watchedDescription = watch('description');
    const watchedSpecialRequests = watch('specialRequests');

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

    useEffect(() => {
        if (watchedStartTime && watchedEndTime) {
            trigger(['startTime', 'endTime']);
        }
    }, [watchedStartTime, watchedEndTime, trigger]);

    const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

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
            if (!data.title || data.title.trim() === '') {
                setError('title', {
                    type: 'manual',
                    message: 'Le titre de l\'événement est requis'
                });
                return;
            }

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

            if (!data.description || data.description.trim() === '') {
                setError('description', {
                    type: 'manual',
                    message: 'La description de l\'événement est requise'
                });
                return;
            }

            const cleanData = {
                ...data,
                customerId: selectedUser.id,
                title: data.title.trim(),
                description: data.description.trim(),
                specialRequests: data.specialRequests?.trim() || undefined,
                contactPhone: data.contactPhone?.trim() || undefined,
                meetingRoomId: data.meetingRoomId === '' ? undefined : data.meetingRoomId,
                startTime: data.startTime ? (data.startTime.includes(':00') ? data.startTime : `${data.startTime}:00`) : undefined,
                endTime: data.endTime ? (data.endTime.includes(':00') ? data.endTime : `${data.endTime}:00`) : undefined
            };

            console.log('Données de demande d\'événement à envoyer:', cleanData);

            await createMutation.mutateAsync(cleanData);
            toast.success('Demande d\'événement créée avec succès !');
            navigate('/event-requests');
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            const errorMessage = extractEventErrorMessage(error);
            toast.error(errorMessage);

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

    const needsSpecificRoom = watch('meetingRoomId');
    const roomsToDisplay = needsSpecificRoom && startTime && endTime
        ? availableMeetingRooms
        : meetingRooms;

    const canSubmit = !isSubmitting &&
        !createMutation.isPending &&
        watchedTitle &&
        selectedUser &&
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