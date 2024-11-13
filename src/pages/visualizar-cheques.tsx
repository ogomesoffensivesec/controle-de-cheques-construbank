// src/pages/Cheques.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { Cheque } from '@/interfaces/cheque';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/db/firebase';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

// Importações adicionadas
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Cheques: React.FC = () => {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados para o React Table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const navigate = useNavigate();

  // Estado para o intervalo de datas
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  /**
   * Busca os cheques no Firestore.
   */
  useEffect(() => {
    const fetchCheques = async () => {
      setIsLoading(true);
      try {
        const chequesCollectionRef = collection(db, 'cheques');
        const chequesSnapshot = await getDocs(chequesCollectionRef);
        const chequesList = chequesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Cheque[];
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

  // Definição das colunas para o Data Table
  const columns: ColumnDef<Cheque>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
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
      accessorKey: 'numeroOperacao',
      header: 'Número da Operação',
      filterFn: 'includesString',
    },
    {
      accessorKey: 'numeroCheque',
      header: 'Número do Cheque',
      filterFn: 'includesString',
    },
    {
      accessorKey: 'dataRetirada',
      header: 'Data de Retirada',
      cell: ({ row }) => {
        const dataRetirada = new Date(row.getValue('dataRetirada'));
        return (
          <div>{format(dataRetirada, 'dd/MM/yyyy')}</div>
        );
      },
      filterFn: (row, id, filterValue) => {
        const date = new Date(row.getValue(id));
        const from = filterValue.from ? new Date(filterValue.from) : null;
        const to = filterValue.to ? new Date(filterValue.to) : null;

        if (from && to) {
          return date >= from && date <= to;
        } else if (from) {
          return date >= from;
        } else if (to) {
          return date <= to;
        }
        return true;
      },
    },
    {
      accessorKey: 'nome',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === 'asc')
          }
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'local',
      header: 'Local',
    },
    {
      accessorKey: 'banco',
      header: "Banco",
      cell: ({ row }) => row.getValue('banco')
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>
        Ações
      </div>,
      cell: ({ row }) => {
        const cheque = row.original;
        return (
          <div className='w-full flex justify-center'>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/cheques/${cheque.id}`)}
            >
              Detalhes
            </Button>
          </div>

        );
      },
    },
  ];

  // Configuração da tabela usando o hook useReactTable
  const table = useReactTable({
    data: cheques,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /**
   * Função para exportar o relatório em PDF dos cheques no escritório.
   */
  const exportarRelatorioPDF = () => {
    // Filtra os cheques que estão no escritório
    const chequesNoEscritorio = cheques.filter((cheque) => cheque.local === 'Escritório');

    if (chequesNoEscritorio.length === 0) {
      toast.error('Não há cheques no escritório para exportar.');
      return;
    }

    const doc = new jsPDF();

    // Título do relatório
    doc.setFontSize(18);
    doc.text('Relatório de Cheques no Escritório', 14, 22);

    // Data de geração do relatório
    doc.setFontSize(12);
    doc.text(`Data: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

    // Tabela com os cheques
    const tableColumn = ["Número do Cheque", "Banco", "Vencimento", "Nome", "Valor"];
    const tableRows: any = [];

    chequesNoEscritorio.forEach((cheque) => {
      const vencimento = cheque.vencimento
        ? format(new Date(cheque.vencimento), 'dd/MM/yyyy')
        : '';
      const valorFormatado = cheque.valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      const chequeData = [
        cheque.numeroCheque,
        cheque.banco,
        vencimento,
        cheque.nome,
        valorFormatado,
      ];
      tableRows.push(chequeData);
    });

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
    });

    // Total de cheques e valor total
    const valorTotal = chequesNoEscritorio.reduce((total, cheque) => total + cheque.valor, 0);
    doc.setFontSize(12);
    doc.text(`Total de Cheques: ${chequesNoEscritorio.length}`, 14, doc.lastAutoTable.finalY + 10);
    doc.text(
      `Valor Total: ${valorTotal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}`,
      14,
      doc.lastAutoTable.finalY + 16
    );

    // Salva o PDF
    doc.save('Relatorio_Cheques_Escritorio.pdf');
  };

  return (
    <div className="w-full min-h-screen p-4 space-y-6">
      <ToastContainer />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold">Cheques Cadastrados</h1>
        <div className="flex space-x-2">
          <Button onClick={exportarRelatorioPDF}>
            Exportar Relatório
          </Button>
          <Button onClick={() => navigate('/cheques/novo')}>
            Cadastrar Cheques
          </Button>
        </div>
      </div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <>
          {cheques.length === 0 ? (
            <p>Nenhum cheque cadastrado.</p>
          ) : (
            <div>
              {/* Filtro e opções da tabela */}
              <div className="flex flex-col md:flex-row items-start md:items-center py-4 space-y-4 md:space-y-0 md:space-x-4">
                <Input
                  placeholder="Filtrar por Número da Operação..."
                  value={
                    (table.getColumn('numeroOperacao')?.getFilterValue() as string) ?? ''
                  }
                  onChange={(event) =>
                    table.getColumn('numeroOperacao')?.setFilterValue(event.target.value)
                  }
                  className="max-w-xs"
                />
                <Input
                  placeholder="Filtrar por Número do Cheque..."
                  value={
                    (table.getColumn('numeroCheque')?.getFilterValue() as string) ?? ''
                  }
                  onChange={(event) =>
                    table.getColumn('numeroCheque')?.setFilterValue(event.target.value)
                  }
                  className="max-w-xs"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[300px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                            {format(dateRange.to, 'dd/MM/yyyy')}
                          </>
                        ) : (
                          format(dateRange.from, 'dd/MM/yyyy')
                        )
                      ) : (
                        <span>Filtrar por Data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(newRange) => {
                        setDateRange({ from: newRange?.from, to: newRange?.to ?? undefined });
                        table.getColumn('dataRetirada')?.setFilterValue(newRange);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Tabela de dados */}
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
                          Nenhum resultado encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Controles de paginação e seleção */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} de{' '}
                  {table.getFilteredRowModel().rows.length} cheque(s) selecionado(s).
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cheques;
