export interface Licao {
  id: number;
  titulo: string;
  conteudo: string;
  ordemNoNivel: number;
  nivelId: number;
}

export interface Nivel {
  id: number;
  titulo: string;
  descricao?: string;
  numeroNivel: number;
}
