// src/pages/Remessas.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { Remessa } from '@/interfaces/remessa';
import { collection, getDocs } from 'firebase/firestore';
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
import { useAuth } from '@/contexts/auth-context';

const Remessas: React.FC = () => {
  const [remessas, setRemessas] = useState<Remessa[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { currentUser }: any = useAuth();


  useEffect(() => {
    if (currentUser.isClient) {
      navigate('/')
    }
    const fetchRemessas = async () => {
      setIsLoading(true);
      try {
        const remessasCollectionRef = collection(db, 'remessas');
        const remessasSnapshot = await getDocs(remessasCollectionRef);
        const remessasList = remessasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Remessa[];
        setRemessas(remessasList);
      } catch (error) {
        console.error('Erro ao buscar remessas:', error);
        toast.error('Ocorreu um erro ao buscar as remessas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemessas();
  }, []);

  const columns: ColumnDef<Remessa>[] = [
    {
      accessorKey: 'protocolo',
      header: 'Protocolo',
    },
    {
      accessorKey: 'dataRemessa',
      header: 'Data da Remessa',
      cell: ({ row }) => {
        const data = new Date(row.getValue('dataRemessa'));
        return data.toLocaleDateString('pt-BR');
      },
    },
    {
      accessorKey: 'emitidoPor',
      header: 'Emitido por',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'documentoPdfUrl',
      header: 'Documento Protocolo',
      cell: ({ row }) => {
        const url = row.getValue<string>('documentoPdfUrl');
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download
          </a>
        ) : (
          'Não disponível'
        );
      },
    },
    {
      accessorKey: 'documentoAssinadoUrl',
      header: 'Documento assinado',
      cell: ({ row }) => {
        const url = row.getValue<string>('documentoAssinadoUrl');
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download
          </a>
        ) : (
          'Não disponível'
        );
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const remessa = row.original;
        return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/remessas/${remessa.id}`)}
            >
              Detalhes
            </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: remessas,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full min-h-screen p-4 space-y-6">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Remessas</h1>
        <Button onClick={() => navigate('/remessas/nova-remessa')}>
          Iniciar Nova Remessa
        </Button>
      </div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <>
          {remessas.length === 0 ? (
            <p>Nenhuma remessa encontrada.</p>
          ) : (
            <div>
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
                        <TableRow key={row.id}>
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
                          Nenhuma remessa encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Remessas;
