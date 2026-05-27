import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { JogadorSessao } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class JogadorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/jogadores`;

  private _jogador$ = new BehaviorSubject<Partial<JogadorSessao> | null>(null);
  readonly jogador$ = this._jogador$.asObservable();

  buscarPorId(id: number): Observable<JogadorSessao> {
    return this.http.get<JogadorSessao>(`${this.apiUrl}/${id}`).pipe(
      tap(data => this._jogador$.next(data))
    );
  }

  darXp(jogadorId: number, quantidade: number): Observable<JogadorSessao> {
    return this.http.patch<JogadorSessao>(
      `${this.apiUrl}/${jogadorId}/xp?quantidade=${quantidade}`, {}
    ).pipe(
      tap(data => this._jogador$.next(data))
    );
  }

  notificarAtualizacao(dados: Partial<JogadorSessao>): void {
    this._jogador$.next(dados);
  }
}
