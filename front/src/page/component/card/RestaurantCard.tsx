import { Link } from "react-router-dom";
import type { Restaurant } from "../../../api/restaurant/dto/restaurant.ts";

type Props = {
    restaurant: Restaurant;
};

export default function RestaurantCard({ restaurant }: Props) {
    return (
        <div className="card bg-base-100 shadow-md border border-base-200">
            <div className="card-body">
                <h2 className="card-title text-xl font-bold">{restaurant.name}</h2>

                <p className="text-sm text-base-content/80">
                    {restaurant.address.streetNumber} {restaurant.address.streetName}, {restaurant.address.city}
                </p>

                <p className="text-sm">🪑 {restaurant.numberPlace} places</p>

                {restaurant.restaurantFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {restaurant.restaurantFeatures.map((feature) => (
                            <span
                                key={feature}
                                className="badge badge-outline badge-sm"
                            >
                {feature.replaceAll("_", " ")}
              </span>
                        ))}
                    </div>
                )}

                <div className="card-actions mt-4">
                    <Link to={`/restaurants/${restaurant.id}`} className="btn btn-sm btn-primary">
                        Voir
                    </Link>
                </div>
            </div>
        </div>
    );
}
