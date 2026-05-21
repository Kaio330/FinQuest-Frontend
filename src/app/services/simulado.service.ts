import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Questao } from '../models/questao.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SimuladoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/questoes`;

  getQuestoesSimulado(licaoId: number): Observable<Questao[]> {
    return this.http.get<Questao[]>(`${this.apiUrl}/licao/${licaoId}`);
  }
}
