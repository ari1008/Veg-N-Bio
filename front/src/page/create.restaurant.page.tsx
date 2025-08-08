import Navbar from "./component/navbar.tsx";
import Footer from "./component/footer.tsx";
import CreateRestaurantForm from "./component/form/CreateRestaurantForm.tsx";


export const CreateRestaurantPage = () => {
    return (
        <>
            <Navbar />
            <div
                data-theme="vegnbio"
                className="min-h-screen bg-base-100 text-base-content flex flex-col justify-center items-center px-4"
            >
                <CreateRestaurantForm />
            </div>
            <Footer />
        </>
    );
}