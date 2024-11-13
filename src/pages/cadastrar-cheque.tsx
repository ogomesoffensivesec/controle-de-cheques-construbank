// src/pages/NovoCheque.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage, db } from '@/db/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactInputMask from 'react-input-mask';
import { Trash, Edit2 } from 'lucide-react';
import { Cheque } from '@/interfaces/cheque';
import { v4 } from 'uuid';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/auth-context';


const NovoCheque: React.FC = () => {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const { currentUser } = useAuth()
  const [chequeAtual, setChequeAtual] = useState<Cheque>({
    id: v4(),
    leitora: '',
    numeroCheque: '',
    nome: '',
    cpf: '',
    valor: 0,
    motivoDevolucao: '',
    numeroOperacao: '',
    anexoFile: null,
    quemRetirou: '',
    dataRetirada: '',
    local: 'Escritório',
    banco: '',
    vencimento: '',
    log: []
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const navigate = useNavigate();

  /**
   * Função para atualizar os campos do formulário.
   * @param field Campo a ser atualizado.
   * @param value Valor do campo.
   */
  const handleChange = (
    field: keyof Cheque,
    value: string | number | File | null
  ) => {
    setChequeAtual((prevCheque) => ({
      ...prevCheque,
      [field]: value,
    }));
  };

  /**
   * Função para adicionar o cheque atual à lista de cheques.
   */
  const handleAddCheque = () => {
    // Validação dos campos obrigatórios
    if (
      !chequeAtual.leitora ||
      !chequeAtual.numeroCheque ||
      !chequeAtual.nome ||
      !chequeAtual.cpf ||
      !chequeAtual.valor ||
      !chequeAtual.quemRetirou ||
      !chequeAtual.dataRetirada ||
      !chequeAtual.banco
    ) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isEditing) {
      // Editando um cheque existente
      setCheques((prevCheques) =>
        prevCheques.map((cheque) =>
          cheque.id === chequeAtual.id ? chequeAtual : cheque
        )
      );
      setIsEditing(false);
    } else {
      // Adicionando um novo cheque
      setCheques((prevCheques) => [...prevCheques, chequeAtual]);
    }

    // Limpar o formulário
    setChequeAtual({
      id: v4(),
      leitora: '',
      numeroCheque: '',
      nome: '',
      cpf: '',
      valor: 0,
      motivoDevolucao: '',
      numeroOperacao: '',
      anexoFile: null,
      quemRetirou: '',
      dataRetirada: '',
      local: 'Escritório',
      banco: '',
      vencimento: '',
      log: []
    });
  };

  /**
   * Função para editar um cheque da lista.
   * @param id Identificador do cheque a ser editado.
   */
  const handleEditCheque = (id: string) => {
    const chequeParaEditar = cheques.find((cheque) => cheque.id === id);
    if (chequeParaEditar) {
      setChequeAtual(chequeParaEditar);
      setIsEditing(true);
    }
  };

  /**
   * Função para remover um cheque da lista.
   * @param id Identificador do cheque a ser removido.
   */
  const handleRemoveCheque = (id: string) => {
    setCheques((prevCheques) => prevCheques.filter((cheque) => cheque.id !== id));
  };

  /**
   * Função para fazer o upload do anexo e retornar a URL.
   * @param file Arquivo a ser enviado.
   * @returns URL do arquivo enviado.
   */
  const uploadAnexo = async (file: File, chequeId: string): Promise<string> => {
    const storageRefPath = ref(storage, `cheques/anexos/${chequeId}/${file.name}`);
    const snapshot = await uploadBytes(storageRefPath, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  /**
   * Função para lidar com a submissão do formulário.
   * @param e Evento de submissão do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setIsSubmitting(true);

    if (cheques.length === 0) {
      toast.error('Adicione pelo menos um cheque antes de salvar.');
      setIsSubmitting(false);
      return;
    }

    try {
      const chequesCollectionRef = collection(db, 'cheques');

      for (const cheque of cheques) {
        let anexoUrl = '';
        if (cheque.anexoFile) {
          anexoUrl = await uploadAnexo(cheque.anexoFile, cheque.id);
        }

        await addDoc(chequesCollectionRef, {
          leitora: cheque.leitora,
          numeroCheque: cheque.numeroCheque,
          nome: cheque.nome,
          cpf: cheque.cpf,
          valor: cheque.valor,
          motivoDevolucao: cheque.motivoDevolucao,
          numeroOperacao: cheque.numeroOperacao,
          anexoUrl,
          quemRetirou: cheque.quemRetirou,
          dataRetirada: cheque.dataRetirada,
          local: cheque.local,
          createdAt: Timestamp.now(),
          banco: cheque.banco,
          vencimento: cheque.vencimento,
          log: [
            {
              timestamp: Timestamp.now(),
              message: 'Cheque adicionado',
              user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
            },
          ], // Log inicial adicionado
        });
      }

      toast.success('Cheques cadastrados com sucesso!');
      navigate('/cheques'); // Redireciona para a lista de cheques
    } catch (error) {
      console.error('Erro ao cadastrar cheques:', error);
      toast.error('Ocorreu um erro ao cadastrar os cheques.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatarLeitora = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = event.target.value.replace(/\D/g, '');
    const substringLeitora = formattedValue.slice(12, 17);
    handleChange('numeroCheque', substringLeitora)
    handleChange('leitora', formattedValue)
  }

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
            <BreadcrumbLink href="/cheques">Lista de Cheques</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Cadastro de Cheques</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">Cadastrar Cheques</span>

      </div>

      {/* Lista de Cheques Adicionados */}
      {cheques.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cheques Adicionados</h2>
          <div className="space-y-2">
            {cheques.map((cheque) => (
              <div
                key={cheque.id}
                className="flex items-center justify-between p-4 border rounded-md"
              >
                <div>
                  <p>
                    <strong>Banco:</strong> {cheque.banco}
                  </p>
                  <p>
                    <strong>Leitora:</strong> {cheque.leitora}
                  </p>
                  <p>
                    <strong>Número do Cheque:</strong> {cheque.numeroCheque}
                  </p>
                  <p>
                    <strong>Nome:</strong> {cheque.nome}
                  </p>
                  <p>
                    <strong>Valor:</strong>{' '}
                    {cheque.valor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditCheque(cheque.id)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveCheque(cheque.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}>
        {/* Formulário para adicionar/editar cheque */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Campo Leitora */}
          <div className="space-y-1">
            <Label htmlFor="leitora">Leitora *</Label>
            <Input
              type="text"
              id="leitora"
              value={chequeAtual.leitora}
              onChange={(e) => formatarLeitora(e)}
              placeholder="Leitora"

            />
          </div>
          {/* Campo Número do Cheque */}
          <div className="space-y-1">
            <Label htmlFor="numeroCheque">Número do Cheque *</Label>
            <Input
              type="text"
              id="numeroCheque"
              value={chequeAtual.numeroCheque}
              onChange={(e) => handleChange('numeroCheque', e.target.value)}
              placeholder="Número do Cheque"

            />
          </div>
          {/* Campo Nome */}
          <div className="space-y-1">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              type="text"
              id="nome"
              value={chequeAtual.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Nome"
            />
          </div>
          {/* Campo CPF */}
          <div className="space-y-1">
            <Label htmlFor="cpf">CPF *</Label>
            <ReactInputMask
              type="text"
              id="cpf"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              mask="999.999.999-99"
              value={chequeAtual.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
              placeholder="CPF"

            />
          </div>
          {/* Campo Valor */}
          <div className="space-y-1">
            <Label htmlFor="valor">Valor *</Label>
            <Input
              type="number"
              id="valor"
              value={chequeAtual.valor}
              onChange={(e) => handleChange('valor', Number(e.target.value))}
              placeholder="Valor"

            />
          </div>
          {/* Campo Motivo da Devolução */}
          <div className="space-y-1">
            <Label htmlFor="motivoDevolucao">Motivo da Devolução</Label>
            <Input
              type="text"
              id="motivoDevolucao"
              value={chequeAtual.motivoDevolucao}
              onChange={(e) => handleChange('motivoDevolucao', e.target.value)}
              placeholder="Motivo da Devolução"
            />
          </div>
          {/* Campo Número da Operação */}
          <div className="space-y-1">
            <Label htmlFor="numeroOperacao">Número da Operação</Label>
            <Input
              type="text"
              id="numeroOperacao"
              value={chequeAtual.numeroOperacao}
              onChange={(e) => handleChange('numeroOperacao', e.target.value)}
              placeholder="Número da Operação"
            />
          </div>
          {/* Campo Anexo do Cheque */}
          <div className="space-y-1">
            <Label htmlFor="anexoFile">Anexo do Cheque</Label>
            <Input
              type="file"
              id="anexoFile"
              onChange={(e) =>
                handleChange('anexoFile', e.target.files ? e.target.files[0] : null)
              }
              accept=".pdf, .jpg, .jpeg, .png"
            />
          </div>
          {/* Campo Quem Retirou */}
          <div className="space-y-1">
            <Label htmlFor="quemRetirou">Quem Retirou *</Label>
            <Input
              type="text"
              id="quemRetirou"
              value={chequeAtual.quemRetirou}
              onChange={(e) => handleChange('quemRetirou', e.target.value)}
              placeholder="Nome do responsável"

            />
          </div>
          {/* Campo Data de Retirada */}
          <div className="space-y-1">
            <Label htmlFor="dataRetirada">Data da Retirada *</Label>
            <Input
              type="date"
              id="dataRetirada"
              value={chequeAtual.dataRetirada}
              onChange={(e) => handleChange('dataRetirada', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="vencimento">Vencimento do cheque *</Label>
            <Input
              type="date"
              id="vencimento"
              value={chequeAtual.vencimento}
              onChange={(e) => handleChange('vencimento', e.target.value)}
            />
          </div>
          {/* Campo Local */}
          <div className="space-y-1">
            <Label htmlFor="local">Local</Label>
            <Input
              type="text"
              id="local"
              value={chequeAtual.local}
              onChange={(e) => handleChange('local', e.target.value)}
              placeholder="Local do Cheque"
              disabled
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="banco">Banco</Label>
            <Input
              type="text"
              id="banco"
              value={chequeAtual.banco}
              onChange={(e) => handleChange('banco', e.target.value)}
              placeholder="Banco"
            />
          </div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <Button type="button" onClick={handleAddCheque}>
            {isEditing ? 'Atualizar Cheque' : 'Adicionar Cheque'}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando Cheques...' : 'Cadastrar cheques'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NovoCheque;
