import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conquista } from '../models/conquista.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConquistaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/conquistas`;

  getConquistas(jogadorId: number): Observable<Conquista[]> {
    return this.http.get<Conquista[]>(`${this.apiUrl}/jogador/${jogadorId}`);
  }
}
