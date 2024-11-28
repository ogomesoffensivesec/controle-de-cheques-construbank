"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  ClipboardList,
  Truck,
  Building,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { collection, getDocs, Timestamp } from "firebase/firestore";
import { auth, db } from "@/db/firebase";

import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { Label } from "@/components/ui/label";

import { Cheque } from "@/interfaces/cheque";
import { Remessa } from "@/interfaces/remessa";
import BlurFade from "@/components/ui/blur-fade";
import { useAuth } from "@/contexts/auth-context";

const DashboardHome: React.FC = () => {
  const [cheques, setCheques] = React.useState<Cheque[]>([]);
  const [remessas, setRemessas] = React.useState<Remessa[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [username, setUsername] = React.useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { currentUser }: any = useAuth()
  // Função para buscar cheques e remessas do Firestore
  React.useEffect(() => {
    const fetchCheques = async () => {
      try {
        const chequesCollectionRef = collection(db, "cheques");
        const chequesSnapshot = await getDocs(chequesCollectionRef);
        const chequesData: Cheque[] = chequesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt || Date.now()),
          } as Cheque;
        });
        if (
          currentUser?.isClient
        ) {
          const filterCheques = chequesData.filter(cheque => cheque.clientId === currentUser.clientId)
          console.log(filterCheques);
          setCheques(filterCheques)
          return
        }
        setCheques(chequesData);
      } catch (error) {
        console.error("Erro ao buscar cheques:", error);
        toast.error("Ocorreu um erro ao buscar os cheques.");
      }
    };

    const fetchRemessas = async () => {
      try {
        const remessasCollectionRef = collection(db, "remessas");
        const remessasSnapshot = await getDocs(remessasCollectionRef);
        const remessasData: Remessa[] = remessasSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            dataRemessa: data.dataRemessa,
            cheques: data.cheques,
            status: data.status,
            protocolo: data.protocolo,
            emitidoPor: data.emitidoPor,
            documentoPdfUrl: data.documentoPdfUrl,
          } as Remessa;
        });
        setRemessas(remessasData);
      } catch (error) {
        console.error("Erro ao buscar remessas:", error);
        toast.error("Ocorreu um erro ao buscar as remessas.");
      } finally {
        setIsLoading(false);
      }
    };

    const getUser = async () => {
      onAuthStateChanged(auth, (user) => {
        if (user && (user.displayName === "" || user?.displayName === null)) {
          setIsDialogOpen(true);
        }
      });
    };
    fetchCheques();
    fetchRemessas();
    getUser();
  }, []);

  const getStatusColor = (local: string) => {
    switch (local.toLowerCase()) {
      case "escritório":
        return "text-blue-500";
      case "transporte":
        return "text-yellow-500";
      case "contabilidade":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // Dados para os Gráficos (Exemplo: Cheques por Mês)
  const chartData = React.useMemo(() => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const data = months.map((month, index) => ({
      name: month,
      total: cheques.filter(
        (cheque) => cheque.createdAt && cheque.createdAt.getMonth() === index
      ).length,
    }));
    return data;
  }, [cheques]);

  // Função para contar cheques por local
  const getChequesByLocal = () => {
    const localCounts: { [key: string]: number } = {};
    cheques.forEach((cheque) => {
      const local = cheque.local.toLowerCase();
      if (localCounts[local]) {
        localCounts[local] += 1;
      } else {
        localCounts[local] = 1;
      }
    });
    return localCounts;
  };

  const chequesByLocal = React.useMemo(() => getChequesByLocal(), [cheques]);

  const changeUsername = async () => {
    if (auth?.currentUser) {
      setLoading(true);
      try {
        await updateProfile(auth.currentUser, {
          displayName: username,
        });
        toast.success("Seu nome de usuário foi alterado!");
      } catch (error) {
        toast.error("Houve um erro ao definir. Tente novamente");
      } finally {
        setLoading(false);
        setIsDialogOpen(false);
      }
    }
  };


  const cards = [
    {
      title: 'Total de Cheques',
      icon: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
      value: cheques.length,
      description: 'Total de cheques cadastrados',
    },
    {
      title: 'Cheques no Escritório',
      icon: <Building className="h-4 w-4 text-muted-foreground" />,
      value: cheques.filter(cheque => cheque.local.toLowerCase() === 'escritório').length,
      description: 'Cheques no escritório',
    },
    {
      title: 'Cheques em Transporte',
      icon: <Truck className="h-4 w-4 text-muted-foreground" />,
      value: cheques.filter(cheque => cheque.local.toLowerCase() === 'transporte').length,
      description: 'Cheques em transporte',
    },
    ...(currentUser.isClient
      ? []
      : [
          {
            title: 'Total de Remessas',
            icon: <FileText className="h-4 w-4 text-muted-foreground" />,
            value: remessas.length,
            description: 'Total de remessas criadas',
          },
        ]),
  ];
  
  return (
    !isLoading && (
      <div className="flex-1 space-y-4 px-4 ">
        <ToastContainer />
        <Dialog open={isDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Definir nome de usuário</DialogTitle>
              <DialogDescription>
                Você ainda não definiu seu nome de usuário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu nome de usuário"
              />
            </div>
            <DialogFooter>
              <Button type="button" onClick={changeUsername} disabled={loading}>
                {loading ? "Definindo..." : " Definir nome de usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => (
            <BlurFade delay={0.15 * index} inView key={card.description}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <BlurFade delay={0.40} inView className="col-span-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Cheques Cadastrados por Mês</CardTitle>
                <CardDescription>
                  Total de cheques cadastrados por mês.
                </CardDescription>
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
                    <Tooltip
                      formatter={(value: number) => `${value} cheques`}
                    />
                    <Legend />
                    <Bar
                      dataKey="total"
                      fill="#4ade80"
                      name="Total de Cheques"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </BlurFade>
          <BlurFade className="col-span-3 " inView delay={0.4}>
            <Card className="col-span-3 h-[460px]">
              <CardHeader>
                <CardTitle>Cheques por Local</CardTitle>
                <CardDescription>
                  Distribuição dos cheques por local.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(chequesByLocal).map(([local, count]) => (
                      <TableRow key={local}>
                        <TableCell className="capitalize">{local}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </BlurFade>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <BlurFade className="col-span-4 " inView delay={0.8}>
            <Card className="col-span-4 ">
              <CardHeader>
                <CardTitle>Cheques Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número do Cheque</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Banco</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cheques
                      .filter(cheque => cheque.createdAt)
                      .filter(cheque => cheque.createdAt)
                      .sort(
                        (a, b) => {
                          if (!a.createdAt || !b.createdAt) return 0;
                          return b.createdAt.getTime() - a.createdAt.getTime();
                        }
                      )
                      .slice(0, 5)
                      .map((cheque) => (
                        <TableRow key={cheque.id}>
                          <TableCell>{cheque.numeroCheque}</TableCell>
                          <TableCell>{cheque.nome}</TableCell>
                          <TableCell>{cheque.banco}</TableCell>
                          <TableCell
                            className={`capitalize ${getStatusColor(
                              cheque.local
                            )}`}
                          >
                            {cheque.local}
                          </TableCell>
                          <TableCell>
                            {cheque.createdAt ? cheque.createdAt.toLocaleDateString("pt-BR") : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </BlurFade>
          <BlurFade className="col-span-3 " inView delay={0.8}>

            <Card className="col-span-3  h-[315px]">
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
                <CardDescription>Visão geral dos cheques.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="h-6 w-6 text-green-500" />
                    <span className="text-lg font-semibold">
                      {cheques.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Cheques Totais
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-6 w-6 text-yellow-500" />
                    <span className="text-lg font-semibold">
                      {
                        cheques.filter(
                          (cheque) =>
                            cheque.local.toLowerCase() === "transporte"
                        ).length
                      }
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Cheques em Transporte
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-6 w-6 text-blue-500" />
                    <span className="text-lg font-semibold">
                      {
                        cheques.filter(
                          (cheque) =>
                            cheque.local.toLowerCase() === "escritório"
                        ).length
                      }
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Cheques no Escritório
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-purple-500" />
                    <span className="text-lg font-semibold">
                      {remessas.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Remessas Totais
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

        </div>
      </div>
    )
  );
};

export default DashboardHome;
