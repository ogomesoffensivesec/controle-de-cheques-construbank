// src/components/routes/private-route.tsx
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Opcional: Exibir um spinner ou indicador de carregamento
    return <div>Carregando...</div>;
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
