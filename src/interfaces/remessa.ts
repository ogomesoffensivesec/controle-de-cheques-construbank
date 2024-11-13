import { Cheque } from './cheque';
import { Timestamp } from 'firebase/firestore';

export interface Remessa {
  id?: string;
  protocolo: string;
  dataRemessa: string;
  emitidoPor: string;
  cheques: Cheque[];
  status: string;
  documentoPdfUrl?: string;
  documentoAssinadoUrl?: string;
  recebidoPor?: string;
  log?: Array<{
    timestamp: Timestamp;
    message: string;
    user: string;
  }>;
}
