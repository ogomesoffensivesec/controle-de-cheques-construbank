"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  doc,
  getDoc,
  collection,
  getDocs, deleteDoc,
  Timestamp
} from "firebase/firestore"
import { db } from "@/db/firebase"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
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




// Importações para geração de PDF

// Definição da interface para um cheque
export interface Cheque {
  id: string
  leitora: string
  numeroCheque: string
  nome: string
  cpf: string
  valor: number
  motivoDevolucao: string
  numeroOperacao: string
  anexoUrl: string
  status: string
  assinaturaEntrega: string
  assinaturaRecebimento: string
}

// Definição da interface para uma operação
interface Operacao {
  id: string
  dataRetirada: Date
  quemRetirou: string
  status: string
  createdAt: Date
}

const DetalhesOperacao: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [operacao, setOperacao] = useState<Operacao | null>(null)
  const [cheques, setCheques] = useState<Cheque[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Declaração das funções de atualização de estado para o DataTable
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Fetch Operation and Cheques
  useEffect(() => {
    const fetchOperacao = async () => {
      try {
        if (!id) {
          toast.error("ID da operação não fornecido.")
          setIsLoading(false)
          return
        }

        const operacaoRef = doc(db, "estornos", id)
        const operacaoSnap = await getDoc(operacaoRef)
        if (operacaoSnap.exists()) {
          const data = operacaoSnap.data()

          // Verificar se dataRetirada e createdAt são Timestamps
          const dataRetirada = data.dataRetirada
          const createdAt = data.createdAt

          // Converter para Date se forem Timestamps
          const operacaoData: Operacao = {
            id: operacaoSnap.id,
            dataRetirada:
              dataRetirada instanceof Timestamp
                ? dataRetirada.toDate()
                : new Date(dataRetirada),
            quemRetirou: data.quemRetirou,
            status: data.status,
            createdAt:
              createdAt instanceof Timestamp
                ? createdAt.toDate()
                : new Date(createdAt),
          }

          setOperacao(operacaoData)

          // Buscar cheques
          const chequesRef = collection(db, "estornos", id, "cheques")
          const chequesSnap = await getDocs(chequesRef)
          const chequesData = chequesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Cheque[]
          setCheques(chequesData)
        } else {
          navigate('/estornos')
          toast.error("Operação não encontrada.")
        }
      } catch (error) {
        console.error("Erro ao buscar operação:", error)
        toast.error("Ocorreu um erro ao buscar a operação.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOperacao()
  }, [id])

  // Definição das colunas para o DataTable
  const columns = useMemo<ColumnDef<Cheque>[]>(
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
            aria-label="Selecionar todas as cheques"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label={`Selecionar cheque ${row.original.numeroCheque}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "leitora",
        header: "Leitora",
        cell: info => info.getValue(),
      },
      {
        accessorKey: "numeroCheque",
        header: "Número do Cheque",
        cell: info => info.getValue(),
      },
      {
        accessorKey: "nome",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Nome do cheque
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: info => info.getValue(),
      },
      {
        accessorKey: "cpf",
        header: "CPF",
        cell: info => info.getValue(),
      },
      {
        accessorKey: "valor",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Valor
            <ArrowUpDown />
          </Button>
        ),
        cell: info => {
          const amount = info.getValue<number>()
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)
          return <div className="text-right font-medium">{formatted}</div>
        },
      },
      {
        accessorKey: "motivoDevolucao",
        header: "Motivo da Devolução",
        cell: info => info.getValue(),
      },
      {
        accessorKey: "numeroOperacao",
        header: "Número da Operação",
        cell: info => info.getValue(),
      },
      {
        accessorKey: "anexoUrl",
        header: "Anexo",
        cell: info =>
          info.getValue<string>() ? (
            <a
              href={info.getValue<string>()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Ver Anexo
            </a>
          ) : (
            "N/A"
          ),
      },

      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const cheque = row.original
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
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(cheque.id)}
                >
                  Copiar ID do Cheque
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Editar Cheque</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRemoverCheque(cheque.id)}>
                  Remover Cheque
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [] // Dependências vazias pois não há dependências externas
  )

  // Configuração do DataTable
  const tableInstance = useReactTable({
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
    debugTable: false,
  })

  // Função para remover um cheque
  const handleRemoverCheque = async (chequeId: string) => {
    if (!id) return
    if (!window.confirm("Tem certeza de que deseja remover este cheque?")) return

    try {
      const chequeRef = doc(db, "estornos", id, "cheques", chequeId)
      await deleteDoc(chequeRef)
      setCheques(prev => prev.filter(cheque => cheque.id !== chequeId))
      toast.success("Cheque removido com sucesso.")
    } catch (error) {
      console.error("Erro ao remover cheque:", error)
      toast.error("Ocorreu um erro ao remover o cheque.")
    }
  }


  return (
    <div className="w-full min-h-screen  space-y-6 px-4">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/estornos">Estornos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Estorno Bancário</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isLoading ? (
        <p>Carregando...</p>
      ) : operacao ? (
        <>

          <div >
            <div className="w-full flex justify-between items-center">
              <h1 className="text-2xl font-bold mb-4">Estorno Bancário</h1>
              <Button type="button">
                <Plus className="w-4 h-4" />
                Adicionar cheque
              </Button>
            </div>
            <p>
              <strong>Data Retirada:</strong>{" "}
              {operacao.dataRetirada.toLocaleDateString("pt-BR")}
            </p>
            <p>
              <strong>Quem Retirou:</strong> {operacao.quemRetirou}
            </p>
            <p>
              <strong >Status:</strong> {operacao.status.charAt(0).toUpperCase() + operacao.status.slice(1)}
            </p>


          </div>

          {/* Seção de Cheques */}
          <div className="w-full">
            <h2 className="text-lg font-bold">Cheques</h2>
            {/* Filtro por Nome */}
            <div className="flex items-center py-2">
              <Input
                placeholder="Filtrar por Número da Operação..."
                value={(tableInstance.getColumn("numeroOperacao")?.getFilterValue() as string) ?? ""}
                onChange={event =>
                  tableInstance.getColumn("numeroOperacao")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Colunas <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {tableInstance
                    .getAllColumns()
                    .filter(column => column.getCanHide())
                    .map(column => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value => column.toggleVisibility(!!value)}
                      >
                        {column.id === "select" ? "Selecionar" : column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>

            {/* Renderização do DataTable */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {tableInstance.getHeaderGroups().map(headerGroup => (
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
                  {tableInstance.getRowModel().rows?.length ? (
                    tableInstance.getRowModel().rows.map(row => (
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
                        Nenhum cheque encontrado.
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
                  onClick={() => tableInstance.previousPage()}
                  disabled={!tableInstance.getCanPreviousPage()}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => tableInstance.nextPage()}
                  disabled={!tableInstance.getCanNextPage()}
                >
                  Próxima
                </Button>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                {tableInstance.getFilteredSelectedRowModel().rows.length} de{" "}
                {tableInstance.getFilteredRowModel().rows.length} cheque(s) selecionado(s).
              </div>
            </div>
          </div>


        </>
      ) : (
        <p>Operação não encontrada.</p>
      )}
    </div>
  )
}

export default DetalhesOperacao
