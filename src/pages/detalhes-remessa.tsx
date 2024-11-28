// src/pages/DetalhesRemessa.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Remessa } from '@/interfaces/remessa';
import { arrayUnion, doc, getDoc, Timestamp, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db, storage } from '@/db/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { Cheque } from '@/interfaces/cheque';
import { v4 } from 'uuid';
import { Trash, Edit2, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { classificacoes } from '@/data/cheques';

const DetalhesRemessa: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser }: any = useAuth();
  const navigate = useNavigate();
  const [remessa, setRemessa] = useState<Remessa | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [documentoAssinadoFile, setDocumentoAssinadoFile] = useState<File | null>(null);
  const [recebidoPor, setRecebidoPor] = useState<string>('');

  // Estados para adicionar novos cheques
  const [cheques, setCheques] = useState<Cheque[]>([]);
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
    regiao: '', // Campo Região
    log: [],
    clientId: ''

  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser.isClient) {
      navigate('/')
    }
    const fetchRemessa = async () => {
      if (!id) return;

      setIsLoading(true);

      try {
        const remessaDocRef = doc(db, 'remessas', id);
        const remessaDoc = await getDoc(remessaDocRef);

        if (remessaDoc.exists()) {
          setRemessa({ id: remessaDoc.id, ...remessaDoc.data() } as Remessa);
        } else {
          toast.error('Remessa não encontrada.');
        }
      } catch (error) {
        console.error('Erro ao buscar remessa:', error);
        toast.error('Ocorreu um erro ao buscar a remessa.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemessa();
  }, [id]);

  const handleFinalizeRemessa = async () => {
    if (!remessa || !remessa.id) return;
    if (!documentoAssinadoFile || !recebidoPor) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    setIsSubmitting(true);

    try {
      const storageRefPath = ref(
        storage,
        `remessas/${remessa.id}/${documentoAssinadoFile.name}`
      );
      await uploadBytes(storageRefPath, documentoAssinadoFile);
      const documentoAssinadoUrl = await getDownloadURL(storageRefPath);

      const remessaDocRef = doc(db, 'remessas', remessa.id);
      await updateDoc(remessaDocRef, {
        documentoAssinadoUrl,
        recebidoPor,
        status: 'Finalizada',
        log: arrayUnion({
          timestamp: Timestamp.now(),
          message: 'Remessa finalizada',
          user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
        }),
      });

      for (const cheque of remessa.cheques) {
        const chequeDocRef = doc(db, 'cheques', cheque.id!);
        await updateDoc(chequeDocRef, {
          local: 'Destino Final',
          log: arrayUnion({
            timestamp: Timestamp.now(),
            message: `Remessa ${remessa.protocolo} finalizada`,
            user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
          }),
        });
      }

      toast.success('Remessa finalizada com sucesso!');
      navigate('/remessas');
    } catch (error) {
      console.error('Erro ao finalizar remessa:', error);
      toast.error('Ocorreu um erro ao finalizar a remessa.');
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


  // Funções para adicionar novos cheques
  const handleChange = (
    field: keyof Cheque,
    value: string | number | File | null
  ) => {
    setChequeAtual((prevCheque) => ({
      ...prevCheque,
      [field]: value,
    }));
  };

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

    // Define "Não definido" para regiao se não for fornecida
    const chequeToAdd: Cheque = {
      ...chequeAtual,
      regiao: chequeAtual.regiao.trim() === '' ? 'Não definido' : chequeAtual.regiao.trim(),
    };

    if (isEditing) {
      // Editando um cheque existente
      setCheques((prevCheques) =>
        prevCheques.map((cheque) =>
          cheque.id === chequeToAdd.id ? chequeToAdd : cheque
        )
      );
      setIsEditing(false);
    } else {
      // Adicionando um novo cheque
      setCheques((prevCheques) => [...prevCheques, chequeToAdd]);
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
      regiao: '',
      log: [],
      clientId: ''
    });
  };

  const handleEditCheque = (id: string) => {
    const chequeParaEditar = cheques.find((cheque) => cheque.id === id);
    if (chequeParaEditar) {
      setChequeAtual(chequeParaEditar);
      setIsEditing(true);
    }
  };

  const handleRemoveCheque = (id: string) => {
    setCheques((prevCheques) => prevCheques.filter((cheque) => cheque.id !== id));
  };

  const uploadAnexo = async (file: File, chequeId: string): Promise<string> => {
    const storageRefPath = ref(storage, `cheques/anexos/${chequeId}/${file.name}`);
    const snapshot = await uploadBytes(storageRefPath, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleSubmitCheques = async () => {
    if (!remessa || !remessa.id) return;
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
          anexoUrl = await uploadAnexo(cheque.anexoFile, cheque.id!);
        }

        // Adicionar cheque à coleção 'cheques'
        const newChequeDocRef = await addDoc(chequesCollectionRef, {
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
          local: `Remessa ${remessa.protocolo}`,
          createdAt: Timestamp.now(),
          banco: cheque.banco,
          vencimento: cheque.vencimento,
          regiao: cheque.regiao, // Inclusão do campo Região
          log: [
            {
              timestamp: Timestamp.now(),
              message: 'Cheque adicionado à remessa',
              user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
            },
          ],
        });

        // Obter o ID do novo cheque
        const newChequeId = newChequeDocRef.id;

        // Atualizar o cheque com o ID
        await updateDoc(newChequeDocRef, { id: newChequeId });

        // Adicionar cheque à remessa
        const remessaDocRef = doc(db, 'remessas', remessa.id);
        await updateDoc(remessaDocRef, {
          cheques: arrayUnion({
            id: newChequeId,
            numeroCheque: cheque.numeroCheque,
            banco: cheque.banco,
            vencimento: cheque.vencimento,
            nome: cheque.nome,
            valor: cheque.valor,
            regiao: cheque.regiao, // Inclusão do campo Região na remessa
          }),
        });

        // Atualizar o estado local da remessa
        setRemessa((prev) => {
          if (prev) {
            return {
              ...prev,
              cheques: prev.cheques.concat({
                id: newChequeId,
                numeroCheque: cheque.numeroCheque,
                banco: cheque.banco,
                vencimento: cheque.vencimento,
                nome: cheque.nome,
                valor: cheque.valor,
                regiao: cheque.regiao,
                leitora: cheque.leitora,
                cpf: cheque.cpf,
                quemRetirou: cheque.quemRetirou,
                dataRetirada: cheque.dataRetirada,
                clientId: cheque.clientId,
                local: `Remessa ${remessa.protocolo}`,
              }),
            };
          } else {
            return prev;
          }
        });

      }

      // Limpar a lista de cheques adicionados
      setCheques([]);

      toast.success('Cheques adicionados à remessa com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar cheques:', error);
      toast.error('Ocorreu um erro ao adicionar os cheques.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 space-y-6">
      <ToastContainer />
      {isLoading ? (
        <p>Carregando...</p>
      ) : remessa ? (
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white">Detalhes da Remessa</h1>
            <Button onClick={() => navigate('/remessas')}>
              Voltar para Remessas
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Protocolo:</strong> {remessa.protocolo}
            </p>
            <p>
              <strong>Data da Remessa:</strong>{' '}
              {remessa.dataRemessa
                ? format(
                  typeof remessa.dataRemessa === 'string'
                    ? parseISO(remessa.dataRemessa)
                    : remessa.dataRemessa,
                  'dd/MM/yyyy'
                )
                : 'Data não disponível'}
            </p>
            <p>
              <strong>Emitido por:</strong> {remessa.emitidoPor}
            </p>
            <p>
              <strong>Status:</strong> {remessa.status}
            </p>
            {remessa.recebidoPor && (
              <p>
                <strong>Recebido por:</strong> {remessa.recebidoPor}
              </p>
            )}
            {remessa.documentoPdfUrl && (
              <p>
                <strong>Documento PDF:</strong>{' '}
                <a
                  href={remessa.documentoPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Download
                </a>
              </p>
            )}
            {remessa.documentoAssinadoUrl && (
              <p>
                <strong>Documento Assinado:</strong>{' '}
                <a
                  href={remessa.documentoAssinadoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Visualizar
                </a>
              </p>
            )}
          </div>
          <div className="mt-6">
            {/* Seção para adicionar cheques */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cheques na Remessa</h2>
              {remessa.status !== 'Finalizada' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Cheque
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-6xl'>
                    <DialogHeader>
                      <DialogTitle>Adicionar Cheque</DialogTitle>
                      <DialogDescription>
                        Preencha as informações abaixo para adicionar um novo cheque à remessa.
                      </DialogDescription>
                    </DialogHeader>
                    {/* Formulário para adicionar/editar cheque */}
                    <ScrollArea className="h-[400px] ">
                      <div className='space-y-1.5 pr-6 '>
                        {/* Campo Leitora */}
                        <div className="space-y-1 pr-2  ">
                          <Label htmlFor="leitora">Leitora *</Label>
                          <Input
                            type="text"
                            id="leitora"
                            value={chequeAtual.leitora}
                            onChange={(e) => formatarLeitora(e)}
                            placeholder="Leitora"
                            required
                          />
                        </div>
                        {/* Campo Número do Cheque */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="numeroCheque">Número do Cheque *</Label>
                          <Input
                            type="text"
                            id="numeroCheque"
                            value={chequeAtual.numeroCheque}
                            onChange={(e) => handleChange('numeroCheque', e.target.value)}
                            placeholder="Número do Cheque"
                            required
                          />
                        </div>
                        {/* Campo Nome */}
                        <div className="space-y-1 pr-2">
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
                            required
                          />
                        </div>
                        {/* Campo CPF */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="cpf">CPF/CNPJ *</Label>
                          <Input
                            type="text"
                            id="cpf"
                            value={chequeAtual.cpf}
                            onChange={(e) => handleChange('cpf', e.target.value)}
                            placeholder="CPF/CNPJ"
                            required
                          />
                        </div>
                        {/* Campo Valor */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="valor">Valor *</Label>
                          <Input
                            type="number"
                            id="valor"
                            value={chequeAtual.valor}
                            onChange={(e) => handleChange('valor', Number(e.target.value))}
                            placeholder="Valor"
                            required
                          />
                        </div>
                        {/* Campo Motivo da Devolução */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="motivoDevolucao">Motivo da Devolução</Label>
                          <Select
                            value={chequeAtual.motivoDevolucao}
                            onValueChange={(value) => handleChange('motivoDevolucao', value)}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="w-full">
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Motivo da devolução" />
                                    </SelectTrigger>
                                  </span>
                                </TooltipTrigger>
                                {chequeAtual.motivoDevolucao && (
                                  <TooltipContent>
                                    {/* Adicione aqui uma descrição detalhada do motivo, se disponível */}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                            <SelectContent>
                              {classificacoes.map((cls) => (
                                <SelectItem key={cls.classificacao} value={`${cls.classificacao} - ${cls.motivo}`}>
                                  {cls.classificacao} - {cls.motivo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Campo Número da Operação */}
                        <div className="space-y-1 pr-2">
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
                        <div className="space-y-1 pr-2">
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
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="quemRetirou">Quem Retirou *</Label>
                          <Input
                            type="text"
                            id="quemRetirou"
                            value={chequeAtual.quemRetirou}
                            onChange={(e) => handleChange('quemRetirou', e.target.value)}
                            placeholder="Nome do responsável"
                            required
                          />
                        </div>
                        {/* Campo Data de Retirada */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="dataRetirada">Data da Retirada *</Label>
                          <Input
                            type="date"
                            id="dataRetirada"
                            value={chequeAtual.dataRetirada}
                            onChange={(e) => handleChange('dataRetirada', e.target.value)}
                            required
                          />
                        </div>
                        {/* Campo Vencimento */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="vencimento">Vencimento do cheque *</Label>
                          <Input
                            type="date"
                            id="vencimento"
                            value={chequeAtual.vencimento}
                            onChange={(e) => handleChange('vencimento', e.target.value)}
                            required
                          />
                        </div>
                        {/* Campo Local */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="local">Local *</Label>
                          <Input
                            type="text"
                            id="local"
                            value={chequeAtual.local}
                            onChange={(e) => handleChange('local', e.target.value)}
                            placeholder="Local do Cheque"
                            required
                            disabled
                          />
                        </div>
                        {/* Campo Banco */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="banco">Banco *</Label>
                          <Input
                            type="text"
                            id="banco"
                            value={chequeAtual.banco}
                            onChange={(e) => handleChange('banco', e.target.value)}
                            placeholder="Banco"
                            required
                          />
                        </div>
                        {/* Campo Região */}
                        <div className="space-y-1 pr-2">
                          <Label htmlFor="regiao">Região *</Label>
                          <Input
                            type="text"
                            id="regiao"
                            value={chequeAtual.regiao}
                            onChange={(e) => handleChange('regiao', e.target.value)}
                            placeholder="Região"
                            required
                          />
                        </div>
                      </div>

                    </ScrollArea>
                    <div className="flex justify-between items-center pt-4">
                      <Button type="button" onClick={handleAddCheque}>
                        {isEditing ? 'Atualizar Cheque' : 'Adicionar Cheque'}
                      </Button>
                      <Button type="button" onClick={handleSubmitCheques} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando Cheques...' : 'Salvar Cheques'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {/* Lista de Cheques Adicionados */}
            {cheques.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Cheques a serem adicionados</h2>
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
                        <p>
                          <strong>Região:</strong> {cheque.regiao || 'Não definido'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditCheque(cheque.id!)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRemoveCheque(cheque.id!)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Tabela de Cheques da Remessa */}
            <div className="rounded-md border mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Número do Cheque</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Região</TableHead> {/* Nova coluna Região */}
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remessa.cheques.map((cheque, index) => (
                    <TableRow key={cheque.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{cheque.numeroCheque}</TableCell>
                      <TableCell>{cheque.banco}</TableCell>
                      <TableCell>
                        {cheque.vencimento
                          ? format(parseISO(cheque.vencimento), 'dd/MM/yyyy')
                          : 'Data não disponível'}
                      </TableCell>
                      <TableCell>{cheque.nome}</TableCell>
                      <TableCell>{cheque.regiao || 'Não definido'}</TableCell> {/* Exibição da Região */}
                      <TableCell className="text-right">
                        {cheque.valor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          {remessa.status !== 'Finalizada' && (
            <div className="mt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Finalizar Remessa</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Finalizar Remessa</DialogTitle>
                    <DialogDescription>
                      Preencha as informações abaixo para finalizar a remessa.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="recebidoPor">Recebido por *</Label>
                      <Input
                        type="text"
                        id="recebidoPor"
                        value={recebidoPor}
                        onChange={(e) => setRecebidoPor(e.target.value)}
                        placeholder="Nome de quem recebeu"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentoAssinado">Documento Assinado *</Label>
                      <Input
                        type="file"
                        id="documentoAssinado"
                        onChange={(e) =>
                          setDocumentoAssinadoFile(
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                        accept=".pdf, .jpg, .jpeg, .png"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleFinalizeRemessa} disabled={isSubmitting}>
                        {isSubmitting ? 'Finalizando...' : 'Finalizar Remessa'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      ) : (
        <p>Remessa não encontrada.</p>
      )}
    </div>
  );
};

export default DetalhesRemessa;
