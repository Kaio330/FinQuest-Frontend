import { Licao } from './nivel.model';

export interface Questao {
  idQuestao: number;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  alternativaD: string;
  respostaCorreta: string;
  licao: Licao;
}
