// src/pages/NovaOperacao.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "@/db/firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactInputMask from "react-input-mask";

// Definição da interface para um cheque
interface Cheque {
  id: number;
  leitora: string;
  numeroCheque: string;
  nome: string;
  cpf: string;
  valor: number;
  motivoDevolucao: string;
  numeroOperacao: string;
  anexo: File | null;
}

const NovoEstorno: React.FC = () => {
  const [dataRetirada, setDataRetirada] = useState<string>("");
  const [quemRetirou, setQuemRetirou] = useState<string>("");
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Função para adicionar um novo cheque
  const handleAddCheque = () => {
    const novoCheque: Cheque = {
      id: Date.now(),
      leitora: "",
      numeroCheque: "",
      nome: "",
      cpf: "",
      valor: 0,
      motivoDevolucao: "",
      numeroOperacao: "",
      anexo: null,
    };
    setCheques((prevCheques) => [...prevCheques, novoCheque]);
  };

  // Função para atualizar os campos de um cheque específico
  const handleChange = (
    id: number,
    field: keyof Omit<Cheque, "id">,
    value: string | number | File | null
  ) => {
    setCheques((prevCheques) =>
      prevCheques.map((cheque) =>
        cheque.id === id ? { ...cheque, [field]: value } : cheque
      )
    );
  };

  const criarProtocolo = () => {
    const data = new Date();
    return `${("0" + data.getDate()).substr(-2)}${("0" + (data.getMonth() + 1)).substr(-2)}${data.getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
  }


  // Função para remover um cheque da lista
  const handleRemoveCheque = (id: number) => {
    setCheques((prevCheques) => prevCheques.filter((cheque) => cheque.id !== id));
  };

  // Função para enviar a operação e os cheques para o Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Verificar se todos os campos estão preenchidos e se há pelo menos 1 cheque
    if (!dataRetirada || !quemRetirou || cheques.length === 0) {
      toast.error("Todos os campos devem ser preenchidos e pelo menos 1 cheque deve ser adicionado.");
      setLoading(false);
      return;
    }

    try {
      const protocolo = await criarProtocolo()
      const operacaoRef = await addDoc(collection(db, "estornos"), {
        dataRetirada,
        quemRetirou,
        protocolo,
        status: "Escritório",
        createdAt: Timestamp.now(),
      });

      const operacaoId = operacaoRef.id;

      const uploadAnexo = async (file: File): Promise<string> => {
        if (!file) return "";
        const storageRefPath = ref(storage, `estornos/${operacaoId}/anexos/${file.name}`);
        const snapshot = await uploadBytes(storageRefPath, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      };

      const chequesCollectionRef = collection(db, "estornos", operacaoId, "cheques");

      for (const cheque of cheques) {
        let anexoUrl = "";
        if (cheque.anexo) {
          anexoUrl = await uploadAnexo(cheque.anexo);
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
          status: "Escritório",
          createdAt: Timestamp.now(),
        });
      }

      // Redirecionar para a página de detalhes da operação
      navigate(`/estornos/${operacaoId}`);
    } catch (error) {
      console.error("Erro ao iniciar a operação:", error);
      // Aqui você pode adicionar notificações de erro para o usuário
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 space-y-6">
      <div>
        <span className="text-2xl font-bold">Novo estorno</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-[350px] space-y-1">
            <Label htmlFor="data-retirada">Data retirada do banco</Label>
            <Input
              type="date"
              id="data-retirada"
              value={dataRetirada}
              onChange={(e) => setDataRetirada(e.target.value)}
              required
            />
          </div>
          <div className="w-[350px] space-y-1">
            <Label htmlFor="quem-retirou">Quem retirou</Label>
            <Input
              type="text"
              id="quem-retirou"
              value={quemRetirou}
              onChange={(e) => setQuemRetirou(e.target.value)}
              placeholder="Nome do responsável"
              required
            />
          </div>
          <div className="w-[350px] space-y-1">
            <Label htmlFor="status-operacao">Status da operação</Label>
            <Input
              type="text"
              id="status-operacao"
              placeholder="Status atual"
              disabled
              defaultValue={"Escritório"}
            />
          </div>
          <Button type="button" onClick={handleAddCheque}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar cheque
          </Button>
        </div>

        {/* Seção de Cheques */}
        {cheques.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cheques Adicionados</h2>
            {cheques.map((cheque) => (
              <div
                key={cheque.id}
                className="px-4 py-2 border rounded-md shadow-sm flex flex-wrap gap-2 items-end"
              >
                <div className="w-[300px] space-y-1">
                  <Label htmlFor={`leitora-${cheque.id}`}>Leitora</Label>
                  <Input
                    type="text"
                    id={`leitora-${cheque.id}`}
                    value={cheque.leitora}
                    onChange={(e) => handleChange(cheque.id, "leitora", e.target.value)}
                    placeholder="Leitora"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`numeroCheque-${cheque.id}`}>Número do Cheque</Label>
                  <Input
                    type="text"
                    id={`numeroCheque-${cheque.id}`}
                    value={cheque.numeroCheque}
                    onChange={(e) => handleChange(cheque.id, "numeroCheque", e.target.value)}
                    placeholder="Número do Cheque"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`nome-${cheque.id}`}>Nome</Label>
                  <Input
                    type="text"
                    id={`nome-${cheque.id}`}
                    value={cheque.nome}
                    onChange={(e) => handleChange(cheque.id, "nome", e.target.value)}
                    placeholder="Nome"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`cpf-${cheque.id}`}>CPF</Label>
                
                  <ReactInputMask
                    type="text"
                    className="flex h-9 w-[370px] rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    mask="999.999.999-99"
                    onChange={(e) => handleChange(cheque.id, "cpf", e.target.value)}
                    placeholder="CPF"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`valor-${cheque.id}`}>Valor</Label>
                  <Input
                    type="number"
                    id={`valor-${cheque.id}`}
                    value={cheque.valor}
                    onChange={(e) => handleChange(cheque.id, "valor", Number(e.target.value))}
                    placeholder="Valor"
                    required
                  />

                </div>
                <div className="space-y-1">
                  <Label htmlFor={`motivoDevolucao-${cheque.id}`}>Motivo da Devolução</Label>
                  <Input
                    type="text"
                    id={`motivoDevolucao-${cheque.id}`}
                    value={cheque.motivoDevolucao}
                    onChange={(e) => handleChange(cheque.id, "motivoDevolucao", e.target.value)}
                    placeholder="Motivo da Devolução"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`numeroOperacao-${cheque.id}`}>Número da Operação</Label>
                  <Input
                    type="text"
                    id={`numeroOperacao-${cheque.id}`}
                    value={cheque.numeroOperacao}
                    onChange={(e) => handleChange(cheque.id, "numeroOperacao", e.target.value)}
                    placeholder="Número da Operação"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`anexo-${cheque.id}`}>Anexo do Cheque</Label>
                  <Input
                    type="file"
                    id={`anexo-${cheque.id}`}
                    onChange={(e) =>
                      handleChange(
                        cheque.id,
                        "anexo",
                        e.target.files ? e.target.files[0] : null
                      )
                    }
                    accept=".pdf, .jpg, .jpeg, .png"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveCheque(cheque.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <footer className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Criando estorno..." : "Cadastrar estorno"}
          </Button>
        </footer>
      </form>
    </div>
  );
};

export default NovoEstorno;
