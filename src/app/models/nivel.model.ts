export interface Licao {
  id: number;
  titulo: string;
  conteudo: string;
  ordemNoNivel: number;
  nivelId: number;
  // Note: These fields are not in the current backend Licao entity but needed for UI.
  // In a real scenario, you'd update the backend Licao entity to include these, or calculate them.
  // Leaving them optional to keep the UI functioning until the backend is fully synced with the design.
  xpRecompensa?: number;
  moedaRecompensa?: number;
  quantidadeQuestoes?: number;
}

export interface Nivel {
  id: number;
  titulo: string;
  descricao?: string;
  numeroNivel: number;
  // Note: The backend Nivel doesn't return a list of 'licoes' or 'xpMinimo'/'recompensas' directly in its entity yet.
  // These should be fetched or mapped from a DTO in the future. Leaving them here so the UI doesn't break.
  xpMinimo?: number;
  licoes?: Licao[];
  recompensas?: number;
}
