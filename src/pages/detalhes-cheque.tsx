// src/pages/DetalhesCheque.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db, storage } from '@/db/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Trash } from 'lucide-react';
import { Cheque } from '@/interfaces/cheque';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/auth-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { classificacoes } from '@/data/cheques';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Componente para exibir e editar os detalhes de um cheque.
 */
const DetalhesCheque: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const [cheque, setCheque] = useState<Cheque | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const { currentUser } = useAuth(); // Obter o usuário atual

  /**
   * Busca os dados do cheque no Firestore.
   */
  useEffect(() => {
    const fetchCheque = async () => {
      if (!id) return;

      setIsLoading(true);

      try {
        const chequeDocRef = doc(db, 'cheques', id);
        const chequeDoc = await getDoc(chequeDocRef);

        if (chequeDoc.exists()) {
          const data = chequeDoc.data() as Cheque;
          setCheque({
            ...data,
            id: id,
            regiao: data.regiao || 'Não definido', // Definido como "Não definido" se ausente
          });
        } else {
          toast.error('Cheque não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar cheque:', error);
        toast.error('Ocorreu um erro ao buscar o cheque.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheque();
  }, [id]);

  /**
   * Função para atualizar os campos do cheque.
   * @param field Campo a ser atualizado.
   * @param value Valor do campo.
   */
  const handleChange = (
    field: keyof Cheque,
    value: string | number | File | null
  ) => {
    if (cheque) {
      setCheque((prevCheque) => prevCheque && { ...prevCheque, [field]: value });
    }
  };

  /**
   * Função para fazer o upload do anexo e retornar a URL.
   * @param file Arquivo a ser enviado.
   * @returns URL do arquivo enviado.
   */
  const uploadAnexo = async (file: File): Promise<string> => {
    if (!cheque ) return '';
    const storageRefPath = ref(storage, `cheques/anexos/${id}/${file.name}`);
    const snapshot = await uploadBytes(storageRefPath, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  /**
   * Função para atualizar as informações do cheque.
   */
  const handleUpdate = async () => {
    if (!cheque ) return;
    setIsUpdating(true);
    try {
      let anexoUrl = cheque.anexoUrl;

      // Verifica se um novo arquivo foi selecionado
      if (cheque.anexoFile) {
        // Deleta o anexo anterior, se existir
        if (cheque.anexoUrl) {
          const previousAnexoRef = ref(storage, cheque.anexoUrl);
          await deleteObject(previousAnexoRef);
        }
        // Faz o upload do novo anexo
        anexoUrl = await uploadAnexo(cheque.anexoFile);
      }

      // Atualiza o cheque no Firestore
      const chequeDocRef = doc(db, 'cheques', id as string);

      await updateDoc(chequeDocRef, {
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
        regiao: cheque.regiao, // Inclusão do campo Região
        log: arrayUnion({
          timestamp: Timestamp.now(),
          message: 'Cheque atualizado',
          user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
        }), // Atualizar log do cheque
      });

      // Verifica se o cheque está associado a uma remessa
      if (cheque.remessaId) {
        const remessaDocRef = doc(db, 'remessas', cheque.remessaId);

        // Executa uma transação para atualizar a remessa de forma atômica
        await runTransaction(db, async (transaction) => {
          const remessaDoc = await transaction.get(remessaDocRef);
          if (!remessaDoc.exists()) {
            throw new Error('Remessa não encontrada.');
          }

          const remessaData = remessaDoc.data() as any;

          // Encontra o índice do cheque na remessa
          const chequeIndex = remessaData.cheques.findIndex((c: Cheque) => c.id === id);
          if (chequeIndex === -1) {
            throw new Error('Cheque não encontrado na remessa.');
          }

          // Atualiza os campos do cheque na remessa
          remessaData.cheques[chequeIndex] = {
            ...remessaData.cheques[chequeIndex],
            leitora: cheque.leitora,
            numeroCheque: cheque.numeroCheque,
            nome: cheque.nome,
            cpf: cheque.cpf,
            valor: cheque.valor,
            motivoDevolucao: cheque.motivoDevolucao,
            numeroOperacao: cheque.numeroOperacao,
            anexoUrl: cheque.anexoUrl,
            quemRetirou: cheque.quemRetirou,
            dataRetirada: cheque.dataRetirada,
            regiao: cheque.regiao, // Atualização do campo Região na remessa
          };

          // Adiciona um log na remessa
          if (!remessaData.log) {
            remessaData.log = [];
          }
          remessaData.log.push({
            timestamp: Timestamp.now(),
            message: `Cheque ${cheque.numeroCheque} atualizado`,
            user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
          });

          // Atualiza a remessa no Firestore
          transaction.update(remessaDocRef, remessaData);
        });
      }

      toast.success('Cheque atualizado com sucesso!');
      setIsSheetOpen(false);
    } catch (error: any) {
      console.error('Erro ao atualizar cheque:', error);
      toast.error(error.message || 'Ocorreu um erro ao atualizar o cheque.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Função para excluir o cheque.
   */
  const handleDelete = async () => {
    if (!cheque ) return;
    if (!window.confirm('Tem certeza de que deseja excluir este cheque?')) return;

    setIsDeleting(true);

    try {
      // Deleta o anexo, se existir
      if (cheque.anexoUrl) {
        const anexoRef = ref(storage, cheque.anexoUrl);
        await deleteObject(anexoRef);
      }

      const chequeDocRef = doc(db, 'cheques', id as string);
      await deleteDoc(chequeDocRef);

      // Se o cheque estiver associado a uma remessa, remove-o da remessa
      if (cheque.remessaId) {
        const remessaDocRef = doc(db, 'remessas', cheque.remessaId);

        await runTransaction(db, async (transaction) => {
          const remessaDoc = await transaction.get(remessaDocRef);
          if (!remessaDoc.exists()) {
            alert('Remessa não encontrada.');
            navigate('/cheques');
            return;
          }

          const remessaData = remessaDoc.data() as any;

          // Filtra o cheque a ser removido
          remessaData.cheques = remessaData.cheques.filter((c: Cheque) => c.id !== id);

          // Adiciona um log na remessa
          if (!remessaData.log) {
            remessaData.log = [];
          }
          remessaData.log.push({
            timestamp: Timestamp.now(),
            message: `Cheque ${cheque.numeroCheque} excluído`,
            user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
          });

          // Atualiza a remessa no Firestore
          transaction.update(remessaDocRef, remessaData);
        });
      }

      toast.success('Cheque excluído com sucesso!');
      navigate('/cheques');
    } catch (error: any) {
      console.error('Erro ao excluir cheque:', error);
      toast.error(error.message || 'Ocorreu um erro ao excluir o cheque.');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Função para formatar a leitora e número do cheque.
   * @param event Evento de mudança no input.
   */
  const formatarLeitora = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = event.target.value.replace(/\D/g, '');
    const substringLeitora = formattedValue.slice(12, 17);
    handleChange('numeroCheque', substringLeitora)
    handleChange('leitora', formattedValue)
  }

  return (
    <div className="w-full min-h-screen p-4 space-y-6">
      <ToastContainer />
      {isLoading ? (
        <p>Carregando...</p>
      ) : cheque ? (
        <div>
          <Breadcrumb className='mb-4'>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cheques">Lista de cheques</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detalhes do cheque: {cheque.numeroCheque}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-white">Detalhes do Cheque: {cheque.numeroCheque}</h1>
            <div className="flex space-x-2">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button>Editar Cheque</Button>
                </SheetTrigger>
                <SheetContent side="top" className='p-4'>
                  <SheetHeader>
                    <SheetTitle>Editar Cheque</SheetTitle>
                    <SheetDescription>
                      Atualize as informações do cheque conforme necessário.
                    </SheetDescription>
                  </SheetHeader>
                  {/* Formulário de edição */}
                  <ScrollArea className='h-[70vh]'>
                    <div className="mt-2 space-y-2">
                      {/* Campo Leitora */}
                      <div>
                        <Label htmlFor="leitora">Leitora *</Label>
                        <Input
                          type="text"
                          id="leitora"
                          value={cheque.leitora}
                          onChange={(e) => formatarLeitora(e)}
                          placeholder="Leitora"
                          
                        />
                      </div>
                      {/* Campo Número do Cheque */}
                      <div>
                        <Label htmlFor="numeroCheque">Número do Cheque *</Label>
                        <Input
                          type="text"
                          id="numeroCheque"
                          value={cheque.numeroCheque}
                          onChange={(e) => handleChange('numeroCheque', e.target.value)}
                          placeholder="Número do Cheque"
                          
                        />
                      </div>
                      {/* Campo Nome */}
                      <div>
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                          type="text"
                          id="nome"
                          value={cheque.nome}
                          onChange={(e) => {
                            e.target.value = e.target.value.toUpperCase();
                            handleChange('nome', e.target.value);
                          }}
                          placeholder="Nome"
                          
                        />
                      </div>
                      {/* Campo CPF/CNPJ */}
                      <div>
                        <Label htmlFor="cpf">CPF/CNPJ *</Label>
                        <Input
                          type="text"
                          id="cpf"
                          value={cheque.cpf}
                          onChange={(e) => handleChange('cpf', e.target.value)}
                          placeholder="CPF/CNPJ"
                          
                        />
                      </div>
                      {/* Campo Valor */}
                      <div>
                        <Label htmlFor="valor">Valor *</Label>
                        <Input
                          type="number"
                          id="valor"
                          value={cheque.valor}
                          onChange={(e) => handleChange('valor', Number(e.target.value))}
                          placeholder="Valor"
                          
                        />
                      </div>
                      {/* Campo Motivo da Devolução */}
                      <div>
                        <Label htmlFor="motivoDevolucao">Motivo da Devolução</Label>
                        <Select
                          value={cheque.motivoDevolucao}
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
                                      <span>{cls.classificacao} -  {cls.motivo}</span>
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
                      <div>
                        <Label htmlFor="numeroOperacao">Número da Operação</Label>
                        <Input
                          type="text"
                          id="numeroOperacao"
                          value={cheque.numeroOperacao}
                          onChange={(e) => handleChange('numeroOperacao', e.target.value)}
                          placeholder="Número da Operação"
                        />
                      </div>
                      {/* Campo Banco */}
                      <div>
                        <Label htmlFor="banco">Banco *</Label>
                        <Input
                          type="text"
                          id="banco"
                          value={cheque.banco}
                          onChange={(e) => handleChange('banco', e.target.value)}
                          placeholder="Banco"
                          
                        />
                      </div>
                      {/* Campo Vencimento */}
                      <div>
                        <Label htmlFor="vencimento">Vencimento do Cheque *</Label>
                        <Input
                          type="date"
                          id="vencimento"
                          value={cheque.vencimento}
                          onChange={(e) => handleChange('vencimento', e.target.value)}
                          
                        />
                      </div>
                      {/* Campo Região */}
                      <div>
                        <Label htmlFor="regiao">Região *</Label>
                        <Input
                          type="text"
                          id="regiao"
                          value={cheque.regiao}
                          onChange={(e) => handleChange('regiao', e.target.value)}
                          placeholder="Região"
                          
                        />
                      </div>
                      {/* Campo Local */}
                      <div>
                        <Label htmlFor="local">Local *</Label>
                        <Input
                          type="text"
                          id="local"
                          value={cheque.local}
                          onChange={(e) => handleChange('local', e.target.value)}
                          placeholder="Local"
                          
                        />
                      </div>
                      {/* Campo Anexo do Cheque */}
                      <div>
                        <Label htmlFor="anexoFile">Anexo do Cheque</Label>
                        <Input
                          type="file"
                          id="anexoFile"
                          onChange={(e) =>
                            handleChange(
                              'anexoFile',
                              e.target.files ? e.target.files[0] : null
                            )
                          }
                          accept=".pdf, .jpg, .jpeg, .png"
                        />
                        {cheque.anexoUrl && (
                          <p className="mt-2">
                            Anexo atual:{' '}
                            <a
                              href={cheque.anexoUrl}
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
                      <div>
                        <Label htmlFor="quemRetirou">Quem Retirou *</Label>
                        <Input
                          type="text"
                          id="quemRetirou"
                          value={cheque.quemRetirou}
                          onChange={(e) => handleChange('quemRetirou', e.target.value)}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      {/* Campo Data de Retirada */}
                      <div>
                        <Label htmlFor="dataRetirada">Data da Retirada *</Label>
                        <Input
                          type="date"
                          id="dataRetirada"
                          value={cheque.dataRetirada}
                          onChange={(e) => handleChange('dataRetirada', e.target.value)}
                        />
                      </div>
                      {/* Botões de ação */}
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? 'Excluindo...' : 'Excluir Cheque'}
                          <Trash className="w-4 h-4 ml-2" />
                        </Button>
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                          {isUpdating ? 'Atualizando...' : 'Salvar Alterações'}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <Card className="w-full">
            <CardContent className='px-6 py-4'>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leitora</p>
                  <p className="font-medium">{cheque.leitora}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Número do Cheque</p>
                  <p className="font-medium">{cheque.numeroCheque}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="font-medium">{cheque.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CPF/CNPJ</p>
                  <p className="font-medium">{cheque.cpf}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                  <p className="font-medium">
                    {cheque.valor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Motivo da Devolução</p>
                  <p className="font-medium">{cheque.motivoDevolucao}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Número da Operação</p>
                  <p className="font-medium">{cheque.numeroOperacao}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quem Retirou</p>
                  <p className="font-medium">{cheque.quemRetirou}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data da Retirada</p>
                  <p className="font-medium">{cheque.dataRetirada}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Local</p>
                  <p className="font-medium">{cheque.local}</p>
                </div>
                {/* Exibição do Campo Região */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Região</p>
                  <p className="font-medium">{cheque.regiao || 'Não definido'}</p>
                </div>
              </div>
              {cheque.anexoUrl && (
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    <a href={cheque.anexoUrl} className='w-full flex justify-center gap-2 items-center' target='_blank' rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                      Visualizar Anexo
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Log de Atividades</h2>
            {/* Exibir registros de log */}
            {cheque.log && cheque.log.length > 0 ? (
              <ScrollArea className="space-y-4 h-[300px]">
                {cheque.log
                  .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds) // Ordenar por data decrescente
                  .map((entry, index) => (
                    <div key={index} className="w-full border-b p-2">
                      <p className="text-xs text-gray-500 ">
                        Por {entry.user} às {format(entry.timestamp.toDate(), 'dd/MM/yyyy HH:mm:ss')}
                      </p>
                      <p>{entry.message}</p>
                    </div>
                  ))}
              </ScrollArea>
            ) : (
              <p>Nenhuma atividade registrada.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Cheque não encontrado.</p>
      )}
    </div>
  );
};

export default DetalhesCheque;
