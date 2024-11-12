// src/pages/DashboardHome.tsx

"use client"

import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Plus, Users, Briefcase, DollarSign, Activity, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { collection, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/db/firebase"

import { Link, useNavigate } from "react-router-dom"

type Operation = {
  id: string
  name: string
  type: string
  date: Date
  status: string
  createdAt: Date
}

const DashboardHome: React.FC = () => {
  const navigate = useNavigate()
  const [operations, setOperations] = React.useState<Operation[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(true)

  // Estados para o Dialog de Criação de Operação
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newOperation, setNewOperation] = React.useState({ name: "", type: "" })

  // Função para buscar operações do Firestore
  React.useEffect(() => {
    const fetchOperations = async () => {
      try {
        const operacoesRef = collection(db, "operacoes")
        const operacoesSnap = await getDocs(operacoesRef)
        const operacoesData: Operation[] = operacoesSnap.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || "Sem Nome",
            type: data.type || "Sem Tipo",
            date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date || Date.now()),
            status: data.status || "Sem Status",
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
          }
        })
        setOperations(operacoesData)
      } catch (error) {
        console.error("Erro ao buscar operações:", error)
        toast.error("Ocorreu um erro ao buscar as operações.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOperations()
  }, [])

  // Função para criar uma nova operação
  const handleCreateOperation = () => {
    if (!newOperation.name || !newOperation.type) {
      toast.error("Por favor, preencha todos os campos.")
      return
    }

    // Redirecionar para a página de criação de nova operação
    navigate("/operacoes/nova-operacao")
    setIsDialogOpen(false)
    setNewOperation({ name: "", type: "" })
  }
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "escritorio":
        return "text-blue-500"
      case "em transito":
        return "text-yellow-500"
      case "entregue":
        return "text-green-500"
      case "finalizado":
        return "text-green-700 font-semibold"
      case "cancelada":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }
  // Dados para os Gráficos (Exemplo: Operações por Mês)
  const chartData = React.useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = months.map(month => ({
      name: month,
      total: operations.filter(op => op.date.getMonth() === months.indexOf(month)).length,
    }))
    return data
  }, [operations])

  // Função para contar operações por status
  const getOperationsByStatus = () => {
    const statusCounts: { [key: string]: number } = {}
    operations.forEach(op => {
      const status = op.status.toLowerCase()
      if (statusCounts[status]) {
        statusCounts[status] += 1
      } else {
        statusCounts[status] = 1
      }
    })
    return statusCounts
  }

  const operationsByStatus = React.useMemo(() => getOperationsByStatus(), [operations])

  return (
  isLoading &&   <div className="flex-1 space-y-4 p-8 pt-6">
  <ToastContainer />
  <div className="flex items-center justify-between space-y-2">
    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
    <div className="flex items-center space-x-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button asChild type="button">
            <Link to={"/operacoes/nova-operacao"} rel="noopener noreferrer">
              <Plus className="mr-2 h-4 w-4" /> Nova Operação
            </Link>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Operação</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da nova operação.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Nome
              </label>
              <Input
                id="name"
                value={newOperation.name}
                onChange={(e) => setNewOperation({ ...newOperation, name: e.target.value })}
                className="col-span-3"
                placeholder="Nome da Operação"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="type" className="text-right">
                Tipo
              </label>
              <Input
                id="type"
                value={newOperation.type}
                onChange={(e) => setNewOperation({ ...newOperation, type: e.target.value })}
                className="col-span-3"
                placeholder="Tipo da Operação"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOperation}>Criar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total de Operações
        </CardTitle>
        <Briefcase className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{operations.length}</div>
        <p className="text-xs text-muted-foreground">
          Total de operações cadastradas
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Operações Ativas
        </CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{operations.filter(op => op.status.toLowerCase() !== "finalizado" && op.status.toLowerCase() !== "cancelada").length}</div>
        <p className="text-xs text-muted-foreground">
          Operações em andamento
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Operações Finalizadas</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{operations.filter(op => op.status.toLowerCase() === "finalizado").length}</div>
        <p className="text-xs text-muted-foreground">
          Operações concluídas
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Operações Canceladas
        </CardTitle>
        <Trash className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{operations.filter(op => op.status.toLowerCase() === "cancelada").length}</div>
        <p className="text-xs text-muted-foreground">
          Operações canceladas
        </p>
      </CardContent>
    </Card>
  </div>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Operações por Mês</CardTitle>
        <CardDescription>Total de operações realizadas por mês.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip formatter={(value: number) => `${value} operações`} />
            <Legend />
            <Bar dataKey="total" fill="#4ade80" name="Total de Operações" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Operações por Status</CardTitle>
        <CardDescription>Distribuição das operações por status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(operationsByStatus).map(([status, count]) => (
              <TableRow key={status}>
                <TableCell className="capitalize">{status}</TableCell>
                <TableCell>{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Operações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .slice(0, 5)
              .map(op => (
                <TableRow key={op.id}>
                  <TableCell>{op.name}</TableCell>
                  <TableCell>{op.type}</TableCell>
                  <TableCell className={`capitalize ${getStatusColor(op.status)}`}>
                    {op.status}
                  </TableCell>
                  <TableCell>{op.date.toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Estatísticas Gerais</CardTitle>
        <CardDescription>Visão geral das operações.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-green-500" />
            <span className="text-lg font-semibold">{operations.length}</span>
            <span className="text-sm text-muted-foreground">Operações Totais</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold">$0</span>
            <span className="text-sm text-muted-foreground">Receita Total</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-yellow-500" />
            <span className="text-lg font-semibold">{operations.filter(op => op.status.toLowerCase() !== "finalizado" && op.status.toLowerCase() !== "cancelada").length}</span>
            <span className="text-sm text-muted-foreground">Operações Ativas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
  )
}

export default DashboardHome
