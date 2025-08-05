import Navbar from "./component/navbar.tsx";
import RegisterForm from "./component/form/RegisterForm.tsx";
import Footer from "./component/footer.tsx";

export function RegisterPage() {
    return (
        <>
            <Navbar />
            <div
                data-theme="vegnbio"
                className="min-h-screen bg-base-100 text-base-content flex flex-col justify-center items-center px-4"
            >
                <RegisterForm />
            </div>
            <Footer />
        </>
    );
}

