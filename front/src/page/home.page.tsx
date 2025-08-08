import Navbar from "./component/navbar.tsx";
import Footer from "./component/footer.tsx";
import { isAuthenticated } from "../util/authentified.ts";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useGetAllRestaurant } from "../api/restaurant/hook/useRestaurant.ts";
import RestaurantCard from "./component/card/RestaurantCard"

function HomePage() {
    const { mutate, data: restaurants, isPending, isError } = useGetAllRestaurant();

    useEffect(() => {
        mutate();
    }, [mutate]);

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100 text-base-content">
            <Navbar />

            <main className="p-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary">Bienvenue chez Veg'N Bio</h1>
                    <p className="mt-4 text-secondary">
                        Une cuisine végétarienne, biologique et locale.
                    </p>

                    {isAuthenticated() && (
                        <div className="mt-8">
                            <Link to="/create_restaurant" className="btn btn-primary">
                                + Créer un restaurant
                            </Link>
                        </div>
                    )}
                </div>

                <section className="mt-10">
                    <h2 className="text-2xl font-semibold mb-4">Nos restaurants</h2>

                    {isPending && (
                        <div className="text-center">Chargement des restaurants...</div>
                    )}

                    {isError && (
                        <div className="text-center text-error">
                            Une erreur est survenue lors du chargement.
                        </div>
                    )}

                    {restaurants && restaurants.length === 0 && (
                        <div className="text-center text-base-content/60">
                            Aucun restaurant pour le moment.
                        </div>
                    )}

                    {restaurants && restaurants.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {restaurants.map((r) => (
                                <RestaurantCard key={r.id} restaurant={r} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default HomePage;
