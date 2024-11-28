// src/pages/ClientsList.tsx

import React, { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/db/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClientCard from '@/components/ui/cliente-card';
import { Cliente } from '@/interfaces/cliente';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeClosed, PlusCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BlurFade from '@/components/ui/blur-fade';
import { useAuth } from '@/contexts/auth-context';

const VisualizarClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { currentUser }: any = useAuth();
  

  const navigate = useNavigate();

  const generatePassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let generatedPassword = '';
    for (let i = 0; i < 6; i++) {
      const index = Math.floor(Math.random() * characters.length);
      generatedPassword += characters.charAt(index);
    }
    setSenha(generatedPassword);
  };

  /**
   * Função para alternar a visibilidade da senha.
   */
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Função para lidar com o envio do formulário de cadastro de cliente.
   * @param e Evento de submissão do formulário.
   */
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de campos obrigatórios
    if (!nome || !email || !senha) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      // Criação do usuário no Firebase Auth
      //const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      // const user = userCredential.user;
      // Adicionar dados do cliente no Firestore
      await addDoc(collection(db, 'clientes'), {
        nome,
        email,
        senha,
        createdAt: Timestamp.now(),
      });

      toast.success('Cliente cadastrado com sucesso!');
      navigate('/clientes'); // Redireciona para a lista de cheques ou outra página apropriada
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      // Mensagens de erro mais específicas podem ser adicionadas aqui
      toast.error('Ocorreu um erro no cadastro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
      setNome('');
      setEmail('');
      setSenha('');
    }
  };

  useEffect(() => {
    if (currentUser.isClient) {
      navigate('/')
    }
    const clientsCollection = collection(db, 'clientes');
    const unsubscribe = onSnapshot(
      clientsCollection,
      (snapshot) => {
        console.log(snapshot);
        const clientsData: Cliente[] = [];
        snapshot.forEach((doc) => {
          clientsData.push({
            id: doc.id,
            ...(doc.data() as Omit<Cliente, 'id'>),
          });
        });
        setClientes(clientsData);
        console.log(clientsData);
      },
      (error) => {
        console.error('Erro ao buscar clientes:', error);
        toast.error('Ocorreu um erro ao buscar os clientes.');
      }
    );

    // Cleanup na desmontagem do componente
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full min-h-screen p-4">
      <ToastContainer />
      <div className='w-full flex justify-between items-center mb-6'>
        <span className="text-2xl font-bold">Lista de Clientes</span>
        <Sheet>
          <Button asChild>
            <SheetTrigger className="flex items-center space-x-2">
              <PlusCircle className='h-4 w-4' />
              <span>Novo cliente</span>
            </SheetTrigger>
          </Button>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Novo Cliente</SheetTitle>
              <SheetDescription>
                Preencha os detalhes do novo cliente abaixo.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCadastro} className="space-y-6">
              {/* Campo Nome */}
              <div className="space-y-1">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do Cliente"
                  required
                />
              </div>
              {/* Campo Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email do Cliente"
                  required
                />
              </div>
              {/* Campo Senha com Botões de Gerar e Alternar Visibilidade */}
              <div className="space-y-1">
                <Label htmlFor="senha">Senha *</Label>
                <div className="flex items-center">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="senha"
                    value={senha}
                    placeholder="Senha"
                    readOnly
                    required
                    className="flex-1"
                  />
                  {/* Botão para gerar senha */}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generatePassword}
                    className="ml-2"
                  >
                    Gerar
                  </Button>
                  {/* Botão para alternar a visibilidade da senha */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={toggleShowPassword}
                    className="ml-2"
                  >
                    {showPassword ? <EyeClosed /> : <Eye />}
                  </Button>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-between items-center pt-4">
                <Button type="submit" disabled={loading || !senha}>
                  {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/clientes')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      {clientes.length === 0 ? (
        <div className='py-4'>
          <p>Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="w-full flex flex-wrap gap-4">
          {clientes.map((cliente, index) => (
            <BlurFade delay={0.25 * index} inView key={cliente.id}>
              <ClientCard cliente={cliente} onUpdate={() => { }} />
            </BlurFade>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisualizarClientes;
