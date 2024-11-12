"use client"

import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  ColumnDef,
  ColumnFiltersState, SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"
import { MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { collection, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/db/firebase"

import "react-datepicker/dist/react-datepicker.css"

// Definição da interface para um Estorno
export interface Estorno {
  id: string
  name: string
  dataRetirada: Date // Alterado para Date
  status: string
  createdAt: Date
  protocolo: string
  assinaturaRecebimento?: string
  nomeRecebimento?: string
}

const TabelaEstornos: React.FC = () => {

  const [estornos, setEstornos] = useState<Estorno[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Estado para o DataTable
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Estados para os novos filtros

  // Fetch Estornos from Firestore
  useEffect(() => {
    const fetchEstornos = async () => {
      try {
        setIsLoading(true)
        const estornosRef = collection(db, "estornos")
        const estornosSnap = await getDocs(estornosRef)
        const estornosData = estornosSnap.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name,
            protocolo: data.protocolo,
            type: data.type,
            date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
            status: data.status,
            dataRetirada: data.dataRetirada instanceof Timestamp ? data.dataRetirada.toDate() : new Date(data.dataRetirada),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            assinaturaRecebimento: data.assinaturaRecebimento,
            nomeRecebimento: data.nomeRecebimento,
          } as Estorno
        })
        console.log(estornosData);
        setEstornos(estornosData)
      } catch (error) {
        console.error("Erro ao buscar estornos:", error)
        toast.error("Ocorreu um erro ao buscar os estornos.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEstornos()
  }, [])

  // Definição das colunas para o DataTable
  const columns = useMemo<ColumnDef<Estorno>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todas as estornos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label={`Selecionar estorno ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "protocolo",
        header: "Protocolo",
        cell: info => info.getValue(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: info => info.getValue(),
      },
      {
        accessorKey: "createdAt",
        header: "Criada em",
        cell: info => {
          const date = info.getValue<Date>()
          return date.toLocaleString("pt-BR")
        },
      },
      {
        accessorKey: "dataRetirada",
        header: "Data Retirada Banco",
        cell: info => {
          const date = info.getValue<Date>()
          return date.toLocaleDateString("pt-BR")
        },
        filterFn: (rows, filterValue) => {
          const startDate = new Date(filterValue[0]);
          const endDate = new Date(filterValue[1]);
          return rows.filter((row) => {
            const rowDate = new Date(row.original.dataRetirada);
            return rowDate >= startDate && rowDate <= endDate;
          });
        },
        sortDescFirst: true,
      },
      {
        accessorKey: "nomeRecebimento",
        header: "Recebido",
        cell: info => info.getValue() ? "Sim" : "Não",
      },

      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const estorno = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu de ações</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link to={`/estornos/${estorno.id}`}>Ver Detalhes</Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <Link to={`/estornos/editar/${estorno.id}`}>Editar Estorno</Link>
                </DropdownMenuItem> */}
                {/* <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setEstornoToFinalize(estorno.id)
                    setIsDialogOpen(true)
                  }}
                  disabled={estorno.status === "finalizado"}
                >
                  Finalizar Estorno
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRemoverEstorno(estorno.id)}>Remover Estorno</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  // Definir funções de filtragem personalizadas
  const filterFns = useMemo(() => ({
    dateRange: (row: any, columnId: string, filterValue: any) => {
      const { startDate, endDate } = filterValue
      const rowDate = new Date(row.getValue(columnId))
      if (startDate && rowDate < startDate) return false
      if (endDate && rowDate > endDate) return false
      return true
    },
  }), [])

  // Função para finalizar a estorno

  // Configuração do DataTable
  const table = useReactTable({
    data: estornos,
    columns,
    filterFns,
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
    debugTable: false,
  })



  return (
    !isLoading && <div className="w-full h-screen mx-auto p-4 space-y-6">
      <ToastContainer />
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Estornos Bancários</h2>

        <div className="flex justify-end mb-4">
          <Button asChild type="button">
            <Link to={"/estornos/novo-estorno"} rel="noopener noreferrer">
              <Plus className="mr-2 h-4 w-4" /> Novo Estorno
            </Link>
          </Button>
        </div>
      </div>

      {/* Seção de Estornos */}
      <div className="space-y-4">

        {/* Seção de Filtros */}
        <div className="flex flex-wrap items-center py-4 space-x-4">
          {/* Filtro por Protocolo */}
          <Input
            placeholder="Filtrar por Protocolo..."
            value={(table.getColumn("protocolo")?.getFilterValue() as string) ?? ""}
            onChange={event =>
              table.getColumn("protocolo")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          {/* Filtro por Status */}
   

          {/* Filtro por Data Retirada */}
          <div className="flex items-center space-x-2">


          </div>


        </div>

        {/* Renderização do DataTable */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
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
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : ""}
                  >
                    {row.getVisibleCells().map(cell => (
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhuma estorno encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Controles de Paginação e Seleção */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
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
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} estorno(s) selecionada(s).
          </div>
        </div>
      </div>


    </div>
  )
}

export default TabelaEstornos
