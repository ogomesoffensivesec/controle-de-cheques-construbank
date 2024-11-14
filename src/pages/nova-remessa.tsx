// src/pages/NovaRemessa.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { Cheque } from '@/interfaces/cheque';
import { Remessa } from '@/interfaces/remessa';
import { collection, getDocs, doc, updateDoc, addDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/db/firebase';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { storage } from '@/db/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/auth-context';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';

const NovaRemessa: React.FC = () => {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCheques, setSelectedCheques] = useState<Cheque[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchCheques = async () => {
      setIsLoading(true);
      try {
        const chequesCollectionRef = collection(db, 'cheques');
        const chequesSnapshot = await getDocs(chequesCollectionRef);
        const chequesList = chequesSnapshot.docs
          .map((doc) => {
            const data = doc.data() as Cheque;
            return {
              ...data,
              id: doc.id,
            };
          })
          .filter((cheque) => cheque.local === 'Escritório');
        setCheques(chequesList);
      } catch (error) {
        console.error('Erro ao buscar cheques:', error);
        toast.error('Ocorreu um erro ao buscar os cheques.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheques();
  }, []);

  // Configuração das colunas da tabela
  const columns: ColumnDef<Cheque>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'numeroCheque',
      header: 'Número do Cheque',
    },
    {
      accessorKey: 'banco',
      header: 'Banco',
    },
    {
      accessorKey: 'vencimento',
      header: 'Vencimento',
      cell: ({ row }) => {
        const vencimento = row.getValue<string>('vencimento');
        return new Date(vencimento).toLocaleDateString('pt-BR');
      },
    },
    {
      accessorKey: 'nome',
      header: 'Nome',
    },
    {
      accessorKey: 'valor',
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => {
        const valor = row.getValue<number>('valor');
        const formatted = valor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
  ];

  // Configuração da tabela usando o useReactTable
  const table = useReactTable({
    data: cheques,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Atualiza selectedCheques sempre que rowSelection mudar
  useEffect(() => {

    const rows = table.getSelectedRowModel().rows.map((row) => row.original);
    setSelectedCheques(rows);
  }, [rowSelection, table]);

  // Função para gerar o protocolo
  const gerarProtocolo = (): string => {
    const datePart = new Date().toLocaleDateString('pt-BR').replace(/\//g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
    return `${datePart}${randomPart}`;
  };

  // Função para gerar o PDF da remessa e salvar no Firebase Storage
  const gerarPDFRemessa = async (remessa: Remessa, remessaId: string): Promise<string> => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Remessa de Cheques', 14, 22);

    // Informações da remessa
    doc.setFontSize(12);
    doc.text(`Protocolo: ${remessa.protocolo}`, 14, 32);
    doc.text(
      `Data da Remessa: ${new Date(remessa.dataRemessa).toLocaleDateString('pt-BR')}`,
      14,
      38
    );
    doc.text(`Emitido por: ${remessa.emitidoPor}`, 14, 44);

    // Tabela de cheques
    const tableBody = remessa.cheques.map((cheque, index) => [
      index + 1,
      cheque.numeroCheque,
      cheque.banco,
      new Date(cheque.vencimento).toLocaleDateString('pt-BR'),
      cheque.nome,
      cheque.valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['#', 'Número do Cheque', 'Banco', 'Vencimento', 'Nome', 'Valor']],
      body: tableBody,
    });

    // Campo para assinatura
    doc.text('Assinatura de Recebimento:', 14, doc.lastAutoTable.finalY + 30);
    doc.line(14, doc.lastAutoTable.finalY + 45, 196, doc.lastAutoTable.finalY + 45);

    // Gerar o PDF em Blob
    const pdfBlob = doc.output('blob');

    // Upload do PDF para o Firebase Storage
    const storageRefPath = ref(storage, `remessas/${remessaId}/Remessa_${remessa.protocolo}.pdf`);
    await uploadBytes(storageRefPath, pdfBlob);

    // Obter a URL de download
    const downloadURL = await getDownloadURL(storageRefPath);

    return downloadURL;
  };

  // Função para iniciar a remessa
  const handleIniciarRemessa = async () => {
    setIsLoading(true)

    if (selectedCheques.length === 0) {
      toast.error('Selecione pelo menos um cheque para iniciar a remessa.');
      return;
    }

    try {
      const protocolo = gerarProtocolo();
      const remessasCollectionRef = collection(db, 'remessas');
      const remessaData: Remessa = {
        protocolo,
        dataRemessa: new Date().toISOString(),
        emitidoPor: currentUser?.displayName as string, // Substitua pelo nome do usuário logado
        cheques: selectedCheques,
        status: 'Transporte',
        log: [
          {
            timestamp: Timestamp.now(),
            message: 'Remessa criada',
            user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
          },
        ], // Log inicial da remessa
      };

      // Adicionar a remessa ao Firestore
      const remessaDocRef = await addDoc(remessasCollectionRef, remessaData);

      // Gerar o PDF da remessa e obter a URL
      const pdfUrl = await gerarPDFRemessa(remessaData, remessaDocRef.id);

      // Atualizar a remessa com a URL do PDF
      await updateDoc(remessaDocRef, {
        documentoPdfUrl: pdfUrl,
      });

      // Atualizar o status dos cheques para "Transporte", associar à remessa e atualizar o log
      for (const cheque of selectedCheques) {
        const chequeDocRef = doc(db, 'cheques', cheque.id!);
        await updateDoc(chequeDocRef, {
          local: 'Transporte',
          remessaId: remessaDocRef.id,
          log: arrayUnion({
            timestamp: Timestamp.now(),
            message: `Cheque incluído na remessa ${remessaData.protocolo}`,
            user: currentUser?.displayName || currentUser?.email || 'Usuário desconhecido',
          }),
        });
      }

      toast.success('Remessa iniciada com sucesso!');
      navigate('/remessas'); // Redireciona para a lista de remessas
    } catch (error) {
      console.error('Erro ao iniciar remessa:', error);
      toast.error('Ocorreu um erro ao iniciar a remessa.');
    } finally {
      setIsLoading(false)
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
            <BreadcrumbLink href="/remessas">Lista de Remessas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Nova Remessa</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold ">Iniciar Nova Remessa</h1>
      </div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <>
          {cheques.length === 0 ? (
            <p>Nenhum cheque disponível no escritório.</p>
          ) : (
            <div>
              {/* Tabela de cheques */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          onClick={() => row.toggleSelected()}
                          className={row.getIsSelected() ? 'bg-gray-100' : ''}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Nenhum cheque encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleIniciarRemessa} disabled={isLoading}>
                  {
                    isLoading ? "Iniciando..." : `Iniciar Remessa com ${selectedCheques.length} Cheque(s)`
                  }
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NovaRemessa;
