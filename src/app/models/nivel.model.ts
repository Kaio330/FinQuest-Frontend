export interface Licao {
  idLicao: number;
  conteudo: string;
  vidasJogador: number;
}

export interface Nivel {
  numNivel: number;
  xpMinimo: number;
  licoes: Licao[];
  recompensas: number;
}
