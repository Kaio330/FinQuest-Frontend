import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { JogadorSessao } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class JogadorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/jogadores`;

  buscarPorId(id: number): Observable<JogadorSessao> {
    return this.http.get<JogadorSessao>(`${this.apiUrl}/${id}`);
  }
}
