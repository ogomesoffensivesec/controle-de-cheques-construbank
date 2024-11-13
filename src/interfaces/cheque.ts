// src/interfaces/cheque.ts

import { Timestamp } from "firebase/firestore";

export interface Cheque {
  id: string;
  leitora: string;
  numeroCheque: string;
  banco: string; // New field
  nome: string;
  cpf: string;
  valor: number;
  vencimento: string; // New field (due date)
  motivoDevolucao?: string;
  numeroOperacao?: string;
  anexoUrl?: string;
  anexoFile?: File | null;
  quemRetirou: string;
  dataRetirada: string;
  local: string;
  remessaId?: string;
  createdAt?: Date;
  log?: Array<{
    timestamp: Timestamp;
    message: string;
    user: string;
  }>;
}




