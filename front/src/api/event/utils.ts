export const EVENT_TYPE_LABELS: Record<string, string> = {
    ANNIVERSAIRE_ENFANT: 'Anniversaire enfant',
    CONFERENCE: 'Conférence',
    SEMINAIRE: 'Séminaire',
    REUNION_ENTREPRISE: 'Réunion d\'entreprise',
    AUTRE: 'Autre'
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé'
};

export const getEventTypeLabel = (type: string): string => {
    return EVENT_TYPE_LABELS[type] || type;
};

export const getEventStatusLabel = (status: string): string => {
    return EVENT_STATUS_LABELS[status] || status;
};

// Fonction pour formater les dates d'événements
export const formatEventDateTime = (dateTime: string): string => {
    try {
        const date = new Date(dateTime);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Date invalide';
    }
};

export const formatEventDate = (dateTime: string): string => {
    try {
        const date = new Date(dateTime);
        return date.toLocaleDateString('fr-FR');
    } catch (error) {
        return 'Date invalide';
    }
};

export const formatEventTime = (dateTime: string): string => {
    try {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '--:--';
    }
};