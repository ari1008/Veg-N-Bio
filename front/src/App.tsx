import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {useEffect, useState} from "react";
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
import { CreateReservationPage } from "./page/create.reservation.page.tsx";
import { ManageReservationPage } from "./page/manage.reservation.page.tsx";
import ReservationPage from "./page/reservation.page.tsx";
import EventRequestsPage from "./page/event-requests.page.tsx";
import {CreateEventRequestPage} from "./page/create.event-request.page.tsx";
import {ManageEventRequestsPage} from "./page/manage.event-requests.page.tsx";
import ChatbotDashboardPage from "./page/chatbot.dashboard.page.tsx";
import ChatbotDiseasesPage from "./page/chatbot.disease.page.tsx";
import ChatbotSessionsPage from "./page/chatbot.session.page.tsx";
import ChatbotReportsPage from "./page/chatbot.report.page.tsx";
import ChatbotAnalyticsPage from "./page/chatbot.analytics.page.tsx";
import ChatbotSettingsPage from "./page/chatbot.setting.page.tsx";

function App() {
    const isAuthenticated = useAuthStore((s) => !!s.authData?.accessToken);

    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        const unsub = useAuthStore.persist?.onFinishHydration?.(() => setHydrated(true));
        if (useAuthStore.persist?.hasHydrated?.()) setHydrated(true);
        return () => unsub?.();
    }, []);

    if (!hydrated) {
        // petit splash/loader si tu veux
        return null;
    }

    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Routes publiques */}
                <Route path="/menus" element={<MenuPage />} />
                <Route path="/restaurants/:id" element={<ViewRestaurantPage />} />

                {/* Routes protégées - Gestion générale */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Routes protégées - Restaurants */}
                <Route
                    path="/create_restaurant"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CreateRestaurantPage />
                        </ProtectedRoute>
                    }
                />

                {/* Routes protégées - Plats */}
                <Route
                    path="/create-dish"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CreateDishPage />
                        </ProtectedRoute>
                    }
                />

                {/* Routes protégées - Commandes */}
                <Route
                    path="/create-order"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <KioskOrderPage />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/reservations"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ReservationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create-reservation"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CreateReservationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/manage-reservations"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ManageReservationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/event-requests"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <EventRequestsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create-event-request"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CreateEventRequestPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/manage-event-requests"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ManageEventRequestsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatbot/dashboard"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ChatbotDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatbot/diseases"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ChatbotDiseasesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatbot/sessions"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ChatbotSessionsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatbot/reports"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ChatbotReportsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatbot/analytics"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ChatbotAnalyticsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chatbot/settings"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ChatbotSettingsPage />
                        </ProtectedRoute>
                    }
                />






            </Routes>
            <Toaster position="top-right" />
        </>
    );
}

export default App;