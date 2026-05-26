import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nivel } from '../models/nivel.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrilhaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/niveis`;

  getTrilhas(): Observable<Nivel[]> {
    return this.http.get<Nivel[]>(`${this.apiUrl}/listar`);
  }
}
