// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { isMockMode } from '../mocks/config';

interface ProtectedRouteProps {
    user: User | null;
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
    if (isMockMode) {
        return <>{children}</>;
    }
    if (!user) {
        return <Navigate to="/" />;
    }
    return <>{children}</>;
};
