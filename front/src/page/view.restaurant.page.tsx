import Navbar from "./component/navbar.tsx";
import LoginForm from "./component/form/LoginForm.tsx";
import Footer from "./component/footer.tsx";
import ViewRestaurant from "./component/ViewRestaurant.tsx";

export function ViewRestaurantPage() {
    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100 text-base-content">
            <Navbar />
            <main className="p-6">
                <ViewRestaurant />
            </main>
            <Footer />
        </div>
    );
}