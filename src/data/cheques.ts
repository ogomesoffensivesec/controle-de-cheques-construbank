import { ClassificacaoMotivo } from "@/lib/tipos-devolucao";

export const classificacoes: ClassificacaoMotivo[] = [
  {
    classificacao: 11,
    motivo: "Cheque sem fundos",
    descricao: "1ª apresentação",
  },
  {
    classificacao: 12,
    motivo: "Cheque sem fundos",
    descricao: "2ª apresentação",
  },
  {
    classificacao: 13,
    motivo: "Conta encerrada",
  },
  {
    classificacao: 14,
    motivo: "Prática espúria",
  },
  {
    classificacao: 20,
    motivo: "Cheque sustado ou revogado",
    descricao:
      "Em virtude de roubo, furto ou extravio de folhas de cheque em branco",
  },
  {
    classificacao: 21,
    motivo: "Cheque sustado ou revogado",
  },
  {
    classificacao: 22,
    motivo: "Divergência ou insuficiência de assinatura",
  },
  {
    classificacao: 23,
    motivo: "Cheques emitidos por entidades e órgãos da administração pública federal direta e indireta",
    descricao:
      "Em desacordo com os requisitos constantes do art. 74, § 2º, do Decreto-Lei nº 200, de 25.2.1967",
  },
  {
    classificacao: 24,
    motivo: "Bloqueio judicial ou determinação do Banco Central do Brasil",
  },
  {
    classificacao: 25,
    motivo: "Cancelamento de talonário pelo participante destinatário",
  },
  {
    classificacao: 26,
    motivo: "Inoperância temporária de transporte",
  },
  {
    classificacao: 27,
    motivo: "Feriado municipal não previsto",
  },
  {
    classificacao: 28,
    motivo: "Cheque sustado ou revogado",
    descricao:
      "Em virtude de roubo, furto ou extravio",
  },
  {
    classificacao: 30,
    motivo: "Furto ou roubo de cheque",
  },
  {
    classificacao: 70,
    motivo: "Sustação ou revogação provisória",
  },
  {
    classificacao: 31,
    motivo: "Erro formal",
    descricao:
      "Sem data de emissão, com o mês grafado numericamente, ausência de assinatura ou não registro do valor por extenso",
  },
  {
    classificacao: 33,
    motivo: "Divergência de endosso",
  },
  {
    classificacao: 34,
    motivo: "Cheque apresentado por participante que não o indicado no cruzamento em preto",
    descricao: "Sem o endosso-mandato",
  },
  {
    classificacao: 35,
    motivo: "Cheque fraudado",
    descricao:
      "Emitido sem prévio controle ou responsabilidade do participante ('cheque universal'), adulteração da praça sacada, ou rasura no preenchimento",
  },
  {
    classificacao: 37,
    motivo: "Registro inconsistente",
  },
  {
    classificacao: 38,
    motivo: "Assinatura digital ausente ou inválida",
  },
  {
    classificacao: 39,
    motivo: "Imagem fora do padrão",
  },
  {
    classificacao: 40,
    motivo: "Moeda inválida",
  },
  {
    classificacao: 41,
    motivo: "Cheque apresentado a participante que não o destinatário",
  },
  {
    classificacao: 42,
    motivo:
      "Cheque não compensável na sessão ou sistema de compensação em que apresentado",
  },
  {
    classificacao: 43,
    motivo:
      "Cheque devolvido anteriormente pelos motivos 21, 22, 23, 24, 31 e 34",
    descricao:
      "Não passível de reapresentação em virtude de persistir o motivo da devolução",
  },
  {
    classificacao: 44,
    motivo: "Cheque prescrito",
  },
  {
    classificacao: 45,
    motivo:
      "Cheque emitido por entidade obrigada a realizar movimentação e utilização de recursos financeiros do Tesouro Nacional",
    descricao: "Mediante Ordem Bancária",
  },
  {
    classificacao: 48,
    motivo:
      "Cheque de valor superior a R$ 100,00 (cem reais), emitido sem a identificação do beneficiário",
  },
  {
    classificacao: 49,
    motivo:
      "Remessa nula, caracterizada pela reapresentação de cheque devolvido pelos motivos 12, 13, 14, 20, 25, 28, 30, 35, 43, 44 e 45",
  },
  {
    classificacao: 59,
    motivo:
      "Informação essencial faltante ou inconsistente não passível de verificação pelo participante remetente",
    descricao: "E não enquadrada no motivo 31",
  },
  {
    classificacao: 60,
    motivo: "Instrumento inadequado para a finalidade",
  },
  {
    classificacao: 61,
    motivo: "Item não compensável",
  },
  {
    classificacao: 64,
    motivo: "Arquivo lógico não processado / processado parcialmente",
  },
  {
    classificacao: 71,
    motivo:
      "Inadimplemento contratual da cooperativa de crédito no acordo de compensação",
  },
  {
    classificacao: 72,
    motivo: "Contrato de compensação encerrado",
  },
];
