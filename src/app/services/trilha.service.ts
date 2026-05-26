import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nivel, Licao } from '../models/nivel.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrilhaService {
  private http = inject(HttpClient);

  getTrilhas(): Observable<Nivel[]> {
    return this.http.get<Nivel[]>(`${environment.apiUrl}/niveis/listar`);
  }

  getLicoes(): Observable<Licao[]> {
    return this.http.get<Licao[]>(`${environment.apiUrl}/licoes/listar`);
  }
}
