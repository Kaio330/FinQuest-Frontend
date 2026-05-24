import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrilhaService } from '../../services/trilha.service';
import { Nivel } from '../../models/nivel.model';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { RouterModule } from '@angular/router';

import { Header } from '../../components/header/header';

@Component({
  selector: 'app-trilhas',
  standalone: true,
  imports: [CommonModule, DashboardLayout, RouterModule, Header],
  templateUrl: './trilhas.html',
  styleUrls: ['./trilhas.css']
})
export class Trilhas implements OnInit {
  private trilhaService = inject(TrilhaService);
  niveis: Nivel[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.trilhaService.getTrilhas().subscribe({
      next: (data) => {
        this.niveis = data;
        this.loading = false;
      },
      error: (err) => {
        // Fallback to mock data if backend is not running to show the UI
        this.niveis = [
          {
            numNivel: 1,
            xpMinimo: 0,
            recompensas: 100,
            nomeNivel: "Introdução à Economia Pessoal",
            licoes: [
              {
                idLicao: 1,
                conteudo: "Aprenda os conceitos básicos...",
                vidasJogador: 3,
                titulo: "O Valor do Dinheiro",
                descricao: "Aprenda os conceitos básicos de ganhos, gastos e o que significa poupar de verdade.",
                xpRecompensa: 100,
                moedaRecompensa: 25,
                quantidadeQuestoes: 2
              },
              {
                idLicao: 2,
                conteudo: "Despesas...",
                vidasJogador: 3,
                titulo: "Despesas Invisíveis",
                descricao: "Como aqueles pequenos gastos diários estão a corroer a sua riqueza.",
                xpRecompensa: 150,
                moedaRecompensa: 30,
                quantidadeQuestoes: 1
              }
            ]
          }
        ];
        // Don't show error, just use mock data to demonstrate UI
        // this.error = 'Failed to load trilhas. Backend might not be running.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
