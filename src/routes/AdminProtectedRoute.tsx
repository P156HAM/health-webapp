// src/routes/AdminProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { isMockMode } from '../mocks/config';

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const { user, userData } = useAuth();

    if (isMockMode) {
        return <>{children}</>;
    }
    if (!user || !userData?.isAdmin) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
