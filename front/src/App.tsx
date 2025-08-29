import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import HomePage from "./page/home.page.tsx";
import { RegisterPage } from "./page/register.page.tsx";
import { LoginPage } from "./page/login.page.tsx";
import { CreateRestaurantPage } from "./page/create.restaurant.page.tsx";
import { useAuthStore } from "./api/auth/store/store.ts";
import ProtectedRoute from "./page/component/ProtectedRoute";
import { ViewRestaurantPage } from "./page/view.restaurant.page";
import { DashboardPage } from "./page/dashboard.page.tsx";
import MenuPage from "./page/menu.page.tsx";
import CreateDishPage from "./page/create.dish.page.tsx";
import KioskOrderPage from "./page/kiosk.order.page.tsx";

function App() {
    const [isAuthenticated] = useState<boolean>(() => {
        return useAuthStore.getState().authData?.accessToken != null;
    });

    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Route publique pour voir les menus */}
                <Route path="/menus" element={<MenuPage />} />
                <Route path="/restaurants/:id" element={<ViewRestaurantPage />} />

                {/* Routes protégées */}
                <Route
                    path="/create_restaurant"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CreateRestaurantPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create-dish"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CreateDishPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create-order"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <KioskOrderPage />
                        </ProtectedRoute>
                    }
                />

        </Routes>
            <Toaster position="top-right" />
        </>
    );
}

export default App;
