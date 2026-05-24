export interface Licao {
  idLicao: number;
  conteudo: string;
  vidasJogador: number;
  titulo?: string;
  descricao?: string;
  xpRecompensa?: number;
  moedaRecompensa?: number;
  quantidadeQuestoes?: number;
}

export interface Nivel {
  numNivel: number;
  xpMinimo: number;
  licoes: Licao[];
  recompensas: number;
  nomeNivel?: string;
}
