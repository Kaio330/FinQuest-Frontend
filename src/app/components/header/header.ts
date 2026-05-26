import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

export interface Jogador {
  id?: number;
  nome?: string;
  email?: string;
  pontuacaoTotal?: number;
  moedas?: number;
  nivelAtual?: number;
  xpAtual?: number;
  xpProximoNivel?: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';

  jogador: Jogador = {
    nome: 'Samuel',
    moedas: 1250,
    nivelAtual: 5,
    xpAtual: 2450,
    xpProximoNivel: 3000
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarDadosJogador(1); // Mocado para ID 1 até implementar contexto de login
  }

  carregarDadosJogador(id: number) {
    this.http.get<Jogador>(`http://localhost:8080/api/jogador/buscarPorId/${id}`).subscribe({
      next: (data) => {
        if (data) {
          // Atualiza dados, mantendo defaults caso algo não venha do back
          this.jogador = { ...this.jogador, ...data };
        }
      },
      error: (err) => {
        console.error('Erro ao buscar dados do jogador:', err);
      }
    });
  }
}
