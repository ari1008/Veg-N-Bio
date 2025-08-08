import HomePage from "./page/home.page.tsx";
import {Route, Routes} from "react-router-dom";


import {Toaster} from "react-hot-toast";
import {RegisterPage} from "./page/register.page.tsx";
import {LoginPage} from "./page/login.page.tsx";
import {CreateRestaurantPage} from "./page/create.restaurant.page.tsx";
import {useState} from "react";
import {useAuthStore} from "./api/auth/store/store.ts";
import ProtectedRoute from "./page/component/ProtectedRoute";
import {ViewRestaurantPage} from "./page/view.restaurant.page";

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return useAuthStore.getState().authData?.accessToken != null;
    });
    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/restaurants/:id" element={<ViewRestaurantPage />} />
                <Route
                    path="/create_restaurant"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CreateRestaurantPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <Toaster position="top-right"/>
        </>
    );
}

export default App;
