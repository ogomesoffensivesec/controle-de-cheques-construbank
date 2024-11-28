// src/pages/login.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from '@/db/firebase';
import { useNavigate, Link } from 'react-router-dom';
import LogoConstrubank from '@/assets/logo.png'
import { collection, getDocs } from 'firebase/firestore';
import { Cliente } from '@/interfaces/cliente';
import { toast, ToastContainer } from 'react-toastify';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [firstAccess, setFirstAccess] = useState<boolean>(false);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const clientesCollectionRef = collection(db, 'clientes');
      const clientesSnapshot = await getDocs(clientesCollectionRef);
      const clientesList = await clientesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Cliente[];
  
      const userCliente = clientesList.find(client => client.email === email);
  
      if (firstAccess) {
        if (!userCliente) {
          toast.error('Usuário não cadastrado como cliente');
          return;
        }
  
        console.log('Primeiro acesso do cliente');
        await createUserWithEmailAndPassword(auth, userCliente.email, userCliente.senha);
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, userCliente.email, userCliente.senha);
        navigate("/");
        return;
      }
  
      if (userCliente) {
        console.log('Usuário é cliente');
        await signInWithEmailAndPassword(auth, userCliente.email, userCliente.senha);
      } else {
        console.log('Usuário não é cliente, tentando logar como membro');
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/");
        return
      }
  
   
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAuthError = (error: any) => {
    switch (error.code) {
      case 'auth/invalid-email':
        setError('Endereço de email inválido.');
        break;
      case 'auth/user-disabled':
        setError('Este usuário está desativado.');
        break;
      case 'auth/user-not-found':
        setError('Usuário não encontrado.');
        break;
      case 'auth/wrong-password':
        setError('Senha incorreta.');
        break;
      default:
        setError('Falha no login. Por favor, tente novamente.');
    }
  };
  


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-zinc-200 dark:from-zinc-800 dark:to-zinc-900 transition-colors duration-500 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <Card className="max-w-md w-full  p-4 shadow-xl transition-shadow duration-300 hover:shadow-2xl dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold tracking-wide text-indigo-900 dark:text-white">
            Entrar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
            {/* Exibir mensagem de erro, se houver */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Label htmlFor="email-address" className="sr-only">
                  Endereço de emmt-8ail
                </Label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 placeholder-zinc-500 dark:placeholder-zinc-400 text-zinc-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-zinc-700 transition-colors duration-200"
                  placeholder="Endereço de email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password" className="sr-only">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 placeholder-zinc-500 dark:placeholder-zinc-400 text-zinc-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-zinc-700 transition-colors duration-200"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-900 dark:text-zinc-300">
                  Lembrar-me
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  name="remember-me"
                  checked={firstAccess}
                  onCheckedChange={(checked) => setFirstAccess(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-900 dark:text-zinc-300">
                  Primeiro Acesso
                </Label>
              </div>

            </div>

            <div className="text-sm flex justify-center">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200">
                Esqueceu sua senha?
              </Link>
            </div>
            <div>
              <Button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200`}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </form>

        </CardContent>
      </Card>
      <div className=' absolute bottom-2 w-full flex justify-center'>
        <img src={LogoConstrubank} alt='Logo Construbank' className='w-auto h-9 cursor-not-allowed' />
      </div>
    </div>
  );
}
