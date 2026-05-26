import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// Espelha exatamente o que o backend retorna em POST /auth/login
export interface JogadorSessao {
  id: number;
  nomePlayer: string;
  email: string;
  nivelAtual: number;
  xpPlayer: number;
  vidasJogador: number;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly USER_KEY = 'finquest_user';

  login(email: string, senha: string): Observable<JogadorSessao> {
    return this.http.post<JogadorSessao>(`${environment.apiUrl}/auth/login`, { email, senha }).pipe(
      tap(resposta => this.salvarSessao(resposta))
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.USER_KEY);
  }

  getJogadorAtual(): JogadorSessao | null {
    const armazenado = sessionStorage.getItem(this.USER_KEY);
    return armazenado ? JSON.parse(armazenado) : null;
  }

  getJogadorId(): number {
    return this.getJogadorAtual()?.id ?? 1;
  }

  getToken(): string | null {
    return this.getJogadorAtual()?.token ?? null;
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  atualizarSessao(dados: Partial<JogadorSessao>): void {
    const atual = this.getJogadorAtual();
    if (atual) {
      this.salvarSessao({ ...atual, ...dados });
    }
  }

  private salvarSessao(jogador: JogadorSessao): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(jogador));
  }
}
