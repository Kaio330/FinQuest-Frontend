export interface Questao {
  id: number;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC?: string;
  alternativaD?: string;
  respostaCorreta: string;
  licaoId: number;
  xpRecompensa: number;
}
