import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TrilhaService } from '../../services/trilha.service';
import { Nivel, Licao } from '../../models/nivel.model';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { RouterModule } from '@angular/router';

import { Header } from '../../components/header/header';

// We create a UI-specific interface to hold the combined data
export interface NivelComLicoes extends Nivel {
  licoes: Licao[];
}

@Component({
  selector: 'app-trilhas',
  standalone: true,
  imports: [CommonModule, DashboardLayout, RouterModule, Header],
  templateUrl: './trilhas.html',
  styleUrls: ['./trilhas.css']
})
export class Trilhas implements OnInit {
  private trilhaService = inject(TrilhaService);

  niveis: NivelComLicoes[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    // Fetch both Niveis and Licoes from the backend in parallel
    forkJoin({
      niveis: this.trilhaService.getTrilhas(),
      licoes: this.trilhaService.getLicoes()
    }).subscribe({
      next: (data) => {
        // Map the flat licoes array to their corresponding nivel
        this.niveis = data.niveis.map(nivel => {
          return {
            ...nivel,
            licoes: data.licoes.filter(licao => licao.nivelId === nivel.id).sort((a, b) => a.ordemNoNivel - b.ordemNoNivel)
          };
        });

        // Sort niveis by number just to be safe
        this.niveis.sort((a, b) => a.numeroNivel - b.numeroNivel);

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar as trilhas. O backend não está respondendo.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
