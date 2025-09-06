import { useParams, Link } from "react-router-dom";
import { useRestaurantById } from "../../api/restaurant/hook/useRestaurant.ts";

const formatTime = (timeArray: [number, number]) => {
    const [hours, minutes] = timeArray;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const translateDay = (day: string) => {
    const translations = {
        'MONDAY': 'Lundi',
        'TUESDAY': 'Mardi',
        'WEDNESDAY': 'Mercredi',
        'THURSDAY': 'Jeudi',
        'FRIDAY': 'Vendredi',
        'SATURDAY': 'Samedi',
        'SUNDAY': 'Dimanche'
    };
    return translations[day as keyof typeof translations] || day;
};

export default function ViewRestaurant() {
    const { id } = useParams();
    const { data: restaurant, isLoading, isError } = useRestaurantById(id!);

    if (isLoading) return <div className="text-center py-10">Chargement...</div>;
    if (isError || !restaurant)
        return <div className="text-center text-error py-10">Erreur de chargement</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="card bg-base-100 shadow-md border border-base-200">
                <div className="card-body space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="card-title text-2xl font-bold">{restaurant.name}</h1>
                            <p className="text-sm text-base-content/80">
                                {restaurant.address.streetNumber} {restaurant.address.streetName}, {restaurant.address.city}
                            </p>
                            <p className="text-sm">🪑 {restaurant.numberPlace} places</p>
                        </div>
                        <Link to="/" className="btn btn-sm btn-outline">
                            ⬅ Retour
                        </Link>
                    </div>

                    {restaurant.restaurantFeatures.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {restaurant.restaurantFeatures.map((feature) => (
                                <span key={feature} className="badge badge-outline badge-sm">
                                    {feature.replaceAll("_", " ")}
                                </span>
                            ))}
                        </div>
                    )}

                    <div>
                        <h2 className="font-semibold text-lg">Horaires</h2>
                        <ul className="space-y-1">
                            {Object.entries(restaurant.availability.openingHours).map(([day, time]) => (
                                <li key={day}>
                                    <strong>{translateDay(day)}</strong> : {formatTime(time.start)} → {formatTime(time.end)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-semibold text-lg">Salles de réunion</h2>
                        {restaurant.meetingRooms.length === 0 ? (
                            <p className="text-sm text-base-content/60">Aucune salle renseignée.</p>
                        ) : (
                            <ul className="space-y-2">
                                {restaurant.meetingRooms.map((room, index) => (
                                    <li key={index} className="border p-3 rounded-md">
                                        <strong>{room.name}</strong> — {room.numberMettingPlace} places —{" "}
                                        {room.isReservable ? "Réservable" : "Non réservable"}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}