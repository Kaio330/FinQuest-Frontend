import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Licao } from '../models/nivel.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LicaoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/licoes`;

  getLicoes(): Observable<Licao[]> {
    return this.http.get<Licao[]>(`${this.apiUrl}/listar`);
  }
}
