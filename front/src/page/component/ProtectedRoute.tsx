import {Navigate, replace} from "react-router-dom";

type Props = {
    isAuthenticated: boolean;
    children: React.ReactNode;
};

export default function ProtectedRoute({ isAuthenticated, children }: Props) {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return <>{children}</>;
}