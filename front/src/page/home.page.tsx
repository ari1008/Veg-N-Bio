import Footer from "./component/footer.tsx";
import Navbar from "./component/navbar.tsx";


function HomePage() {
    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100 text-base-content">
            <Navbar />

            <main className="p-6 text-center">
                <h1 className="text-4xl font-bold text-primary">Bienvenue chez Veg'N Bio</h1>
                <p className="mt-4 text-secondary">
                    Une cuisine végétarienne, biologique et locale.
                </p>
            </main>

            <Footer />
        </div>
    );
}

export default HomePage;
