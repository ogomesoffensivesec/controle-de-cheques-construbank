// src/pages/CadastroCliente.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/db/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { Eye, EyeClosed } from 'lucide-react';
import { v4 } from 'uuid';
import { useAuth } from '@/contexts/auth-context';

const CadastroCliente: React.FC = () => {
  const { currentUser }: any = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar a visibilidade da senha
  const navigate = useNavigate();

  if(currentUser.isClient) {
    navigate('/')
  }
  /**
   * Função para gerar uma senha de 6 caracteres com letras e números.
   */
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
        createdAt: Timestamp.now(),
        id: v4(), // Associação do usuário Auth com o cliente Firestore
      });

      toast.success('Cliente cadastrado com sucesso!');
      navigate('/cheques'); // Redireciona para a lista de cheques ou outra página apropriada
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      // Mensagens de erro mais específicas podem ser adicionadas aqui
      toast.error('Ocorreu um erro no cadastro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 space-y-6">
      <ToastContainer />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Cadastro de Clientes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">Cadastrar Cliente</span>
      </div>

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
    </div>
  );
};

export default CadastroCliente;
