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
import { Trash, Edit2 } from 'lucide-react';
import { Cheque } from '@/interfaces/cheque';
import { v4 } from 'uuid';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { classificacoes } from '@/data/cheques';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Componente de Paginação
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </Button>
      <span>
        Página {currentPage} de {totalPages}
      </span>
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Próxima
      </Button>
    </div>
  );
};

const NovoCheque: React.FC = () => {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const { currentUser } = useAuth();
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
    regiao: '', // Novo campo Região adicionado aqui
    log: []
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const navigate = useNavigate();

  // Estados para Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const chequesPerPage = 3; // Número de cheques por página

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
   * Função para adicionar ou editar o cheque atual na lista de cheques.
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
      !chequeAtual.banco ||
      !chequeAtual.local ||
      !chequeAtual.regiao // Validação para o novo campo Região
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
      toast.success('Cheque atualizado na lista!');
    } else {
      // Adicionando um novo cheque
      setCheques((prevCheques) => [...prevCheques, chequeAtual]);
      toast.success('Cheque adicionado à lista!');
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
      regiao: '', // Reset do campo Região
      log: []
    });

    // Resetar a página para a primeira após adicionar/edit
    setCurrentPage(1);
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
      // Navegar para a página de edição, se necessário
    }
  };

  /**
   * Função para remover um cheque da lista.
   * @param id Identificador do cheque a ser removido.
   */
  const handleRemoveCheque = (id: string) => {
    if (window.confirm('Tem certeza de que deseja remover este cheque da lista?')) {
      setCheques((prevCheques) => prevCheques.filter((cheque) => cheque.id !== id));
      toast.success('Cheque removido da lista!');
    }
  };

  /**
   * Função para fazer o upload do anexo e retornar a URL.
   * @param file Arquivo a ser enviado.
   * @param chequeId Identificador do cheque.
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
          regiao: cheque.regiao, // Inclusão do campo Região no Firestore
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

  /**
   * Função para formatar a leitora e número do cheque.
   * @param event Evento de mudança no input.
   */
  const formatarLeitora = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = event.target.value.replace(/\D/g, '');
    const substringLeitora = formattedValue.slice(12, 17);
    handleChange('numeroCheque', substringLeitora);
    handleChange('leitora', formattedValue);
  };

  /**
   * Cálculo dos cheques a serem exibidos na página atual
   */
  const indexOfLastCheque = currentPage * chequesPerPage;
  const indexOfFirstCheque = indexOfLastCheque - chequesPerPage;
  const currentCheques = cheques.slice(indexOfFirstCheque, indexOfLastCheque);
  const totalPages = Math.ceil(cheques.length / chequesPerPage);

  /**
   * Função para mudar a página
   */
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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

      {/* Lista de Cheques Adicionados - Minimalista */}
      {cheques.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cheques Adicionados</h2>
          <div className="space-y-2">
            {currentCheques.map((cheque) => (
              <div
                key={cheque.id}
                className="flex items-center justify-between p-4 border rounded-md"
              >
                <div>
                  <p>
                    <strong>Nome:</strong> {cheque.nome}
                  </p>
                  <p>
                    <strong>Número do Cheque:</strong> {cheque.numeroCheque}
                  </p>
                  <p>
                    <strong>Valor:</strong>{' '}
                    {cheque.valor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <p>
                    <strong>Região:</strong> {cheque.regiao} {/* Exibição do novo campo */}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditCheque(cheque.id)}
                    title="Editar Cheque"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveCheque(cheque.id)}
                    title="Remover Cheque"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Componente de Paginação */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      >
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
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                handleChange('nome', e.target.value);
              }}
              placeholder="Nome"
              
            />
          </div>
          {/* Campo CPF/CNPJ */}
          <div className="space-y-1">
            <Label htmlFor="cpf">CPF/CNPJ *</Label>
            <Input
              type="text"
              id="cpf"
              value={chequeAtual.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
              placeholder="CPF/CNPJ"
              
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
            <Select
              value={chequeAtual.motivoDevolucao}
              onValueChange={(value) => handleChange('motivoDevolucao', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Motivo da devolução" />
              </SelectTrigger>
              <SelectContent>
                {classificacoes.map((cls) => (
                  <SelectItem key={cls.classificacao} value={`${cls.classificacao} - ${cls.motivo}`}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{cls.classificacao} - {cls.motivo}</span>
                        </TooltipTrigger>
                        {cls.descricao && (
                          <TooltipContent>
                            {cls.descricao}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {/* Campo Banco */}
          <div className="space-y-1">
            <Label htmlFor="banco">Banco *</Label>
            <Input
              type="text"
              id="banco"
              value={chequeAtual.banco}
              onChange={(e) => handleChange('banco', e.target.value)}
              placeholder="Banco"
              
            />
          </div>
          {/* Campo Vencimento */}
          <div className="space-y-1">
            <Label htmlFor="vencimento">Vencimento do Cheque *</Label>
            <Input
              type="date"
              id="vencimento"
              value={chequeAtual.vencimento}
              onChange={(e) => handleChange('vencimento', e.target.value)}
              
            />
          </div>
          {/* Campo Região */}
          <div className="space-y-1">
            <Label htmlFor="regiao">Região *</Label>
            <Input
              type="text"
              id="regiao"
              value={chequeAtual.regiao}
              onChange={(e) => handleChange('regiao', e.target.value)}
              placeholder="Região"
              
            />
          </div>
          {/* Campo Local */}
          <div className="space-y-1">
            <Label htmlFor="local">Local *</Label>
            <Select
              disabled
              value={chequeAtual.local}
              onValueChange={(value) => handleChange('local', value)}
              
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o local" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Escritório">Escritório</SelectItem>
                <SelectItem value="Transporte">Transporte</SelectItem>
                <SelectItem value="Destino Final">Destino Final</SelectItem>
              </SelectContent>
            </Select>
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
            {chequeAtual.anexoUrl && (
              <p className="mt-2">
                Anexo atual:{' '}
                <a
                  href={chequeAtual.anexoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Visualizar
                </a>
              </p>
            )}
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
        </div>
        <div className="flex justify-between items-center pt-4">
          <Button type="button" onClick={handleAddCheque}>
            {isEditing ? 'Atualizar Cheque' : 'Adicionar Cheque'}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando Cheques...' : 'Cadastrar Cheques'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NovoCheque;
