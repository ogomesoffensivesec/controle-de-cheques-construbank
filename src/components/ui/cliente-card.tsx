// src/components/ClientCard.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { db } from '@/db/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { Eye, EyeClosed, Pencil, Trash } from 'lucide-react';
import { Cliente } from '@/interfaces/cliente';



interface ClientCardProps {
  cliente: Cliente;
  onUpdate: () => void; // Função para atualizar a lista de clientes após uma operação
}

const ClientCard: React.FC<ClientCardProps> = ({ cliente, onUpdate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [nome, setNome] = useState(cliente.nome);
  const [email, setEmail] = useState(cliente.email);
  const [senha, setSenha] = useState(cliente.senha);
  const [loading, setLoading] = useState(false);

  /**
   * Função para alternar a visibilidade da senha.
   */
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Função para atualizar os dados do cliente no Firestore.
   */
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !senha) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const clientRef = doc(db, 'clientes', cliente.id);
      await updateDoc(clientRef, {
        nome,
        email,
        senha,
      });

      toast.success('Cliente atualizado com sucesso!');
      setIsEditSheetOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error('Erro na atualização:', error);
      toast.error('Ocorreu um erro ao atualizar o cliente. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para excluir o cliente do Firestore.
   */
  const handleDelete = async () => {
    setLoading(true);
    try {
      const clientRef = doc(db, 'clientes', cliente.id);
      await deleteDoc(clientRef);
      toast.success('Cliente excluído com sucesso!');
      setIsDeleteSheetOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error('Erro na exclusão:', error);
      toast.error('Ocorreu um erro ao excluir o cliente. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className=" w-[320px]">
      <CardHeader>
        <CardTitle>{cliente.nome}</CardTitle>
        <CardDescription className='leading-none'>{cliente.email}
          <div className='w-full m-0 p-0 flex items-center justify-between'>
            {showPassword ? <span>
              {
                cliente.senha
              }
            </span> : "********"}
            <Button
              type="button"
              variant="ghost"
              onClick={toggleShowPassword}
              className="ml-2 "
            >
              {showPassword ? <EyeClosed /> : <Eye />}
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex  space-x-2">
        <Button
          size='sm'
          type="button"
          variant="secondary"
          onClick={() => setIsEditSheetOpen(true)}
          className="flex items-center"
        >
          <Pencil className="mr-1" /> Editar
        </Button>

        {/* Botão de Excluir */}
        <Button
          size='sm'
          type="button"
          variant="destructive"
          onClick={() => setIsDeleteSheetOpen(true)}
          className="flex items-center"
        >
          <Trash className="mr-1" /> Excluir
        </Button>
      </CardFooter>

      {/* Sheet para Edição */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Cliente</SheetTitle>
            <SheetDescription>
              Atualize as informações do cliente.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleUpdate} className="space-y-4 p-4">
            {/* Campo Nome */}
            <div className="space-y-1">
              <Label htmlFor={`edit-nome-${cliente.id}`}>Nome *</Label>
              <Input
                type="text"
                id={`edit-nome-${cliente.id}`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do Cliente"
                required
              />
            </div>
            {/* Campo Email */}
            <div className="space-y-1">
              <Label htmlFor={`edit-email-${cliente.id}`}>Email *</Label>
              <Input
                type="email"
                id={`edit-email-${cliente.id}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email do Cliente"
                required
              />
            </div>
            {/* Campo Senha com Mostrar/Ocultar */}
            <div className="space-y-1">
              <Label htmlFor={`edit-senha-${cliente.id}`}>Senha *</Label>
              <div className="flex items-center">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id={`edit-senha-${cliente.id}`}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleShowPassword}
                  className="ml-2 p-2"
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </Button>
              </div>
            </div>
            {/* Botões de Ação */}
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Atualizando...' : 'Atualizar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditSheetOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet para Exclusão */}
      <Sheet open={isDeleteSheetOpen} onOpenChange={setIsDeleteSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Confirmar Exclusão</SheetTitle>
            <SheetDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </SheetDescription>
          </SheetHeader>
          <div className="flex justify-end space-x-2 p-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteSheetOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default ClientCard;
