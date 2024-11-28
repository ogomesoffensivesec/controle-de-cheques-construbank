// src/components/routes/private-route.tsx
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) {
    // Opcional: Exibir um spinner ou indicador de carregamento
    return <div>Carregando...</div>;
  }

  return !currentUser ? children : <Navigate to="/" replace />;
};

export default PublicRoute;
