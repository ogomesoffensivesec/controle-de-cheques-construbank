// src/pages/logoff.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/db/firebase';

const LogOffPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogoff = async () => {
      try {
        await signOut(auth);
        // Redireciona para a página de login após o logoff
        navigate('/login');
      } catch (error) {
        console.error('Erro ao deslogar:', error);
        // Opcional: Exibir uma mensagem de erro para o usuário
      }
    };

    performLogoff();
  }, [navigate]);

  return <div>Desconectando...</div>; // Opcional: Exibir uma mensagem de carregamento
};

export default LogOffPage;
