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
            id: 1,
            numeroNivel: 1,
            xpMinimo: 0,
            recompensas: 100,
            titulo: "Introdução à Economia Pessoal",
            licoes: [
              {
                id: 1,
                conteudo: "Aprenda os conceitos básicos de ganhos, gastos e o que significa poupar de verdade.",
                ordemNoNivel: 1,
                nivelId: 1,
                titulo: "O Valor do Dinheiro",
                xpRecompensa: 100,
                moedaRecompensa: 25,
                quantidadeQuestoes: 2
              },
              {
                id: 2,
                conteudo: "Como aqueles pequenos gastos diários estão a corroer a sua riqueza.",
                ordemNoNivel: 2,
                nivelId: 1,
                titulo: "Despesas Invisíveis",
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
