import Navbar from "./component/navbar.tsx";
import Footer from "./component/footer.tsx";
import DashboardComponent from "./component/dashboard.component.tsx";


export const DashboardPage = () => {
    return (
        <>
            <Navbar/>
            <div
                data-theme="vegnbio"
                className="min-h-screen bg-base-100 text-base-content flex flex-col justify-center items-center px-4"
            >
                <DashboardComponent/>
            </div>
            <Footer/>
        </>
    );
}