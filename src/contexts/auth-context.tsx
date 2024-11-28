// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/db/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Cliente } from '@/interfaces/cliente';

interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({ currentUser: null, loading: true });

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | any>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    async function getUserByClient(user: any) {
      const clientesCollectionRef = collection(db, 'clientes');
      const clientesSnapshot = await getDocs(clientesCollectionRef);
      const clientesList = await clientesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Cliente[];
      const userCliente = clientesList.find(client => client.email === user?.email)
      if (userCliente) {
        const userToCliente = {
          ...user,
          isClient: true,
          clientId: userCliente.id
        }

        return userToCliente

      }
      else {
        return user
      }
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const current = await getUserByClient(user)
      setCurrentUser(current);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
