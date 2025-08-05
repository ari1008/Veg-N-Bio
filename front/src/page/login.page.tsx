import Navbar from "./component/navbar.tsx";
import Footer from "./component/footer.tsx";
import LoginForm from "./component/form/LoginForm.tsx";


export function LoginPage(): Element{
    return (
        <>
            <Navbar />
            <div
                data-theme="vegnbio"
                className="min-h-screen bg-base-100 text-base-content flex flex-col justify-center items-center px-4"
            >
                <LoginForm />
            </div>
            <Footer />
        </>
    );
}