export interface Objetivo {
  id?: number;
  titulo: string;
  descricao?: string;
  jogadorId: number;
  valorMeta: number;
  valorAtual: number;
  concluido: boolean;
  prazo?: string;
  dataCriacao?: string;
  dataConclusao?: string;
}
