import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Objetivo } from '../models/objetivo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ObjetivoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/objetivos`;

  listarPorJogador(jogadorId: number): Observable<Objetivo[]> {
    return this.http.get<Objetivo[]>(`${this.apiUrl}/jogador/${jogadorId}`);
  }

  criar(objetivo: Omit<Objetivo, 'id' | 'concluido' | 'valorAtual' | 'dataCriacao' | 'dataConclusao'>): Observable<Objetivo> {
    return this.http.post<Objetivo>(this.apiUrl, objetivo);
  }

  atualizarValor(id: number, valorAtual: number): Observable<Objetivo> {
    return this.http.patch<Objetivo>(`${this.apiUrl}/${id}/valor`, { valorAtual });
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
