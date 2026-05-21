import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SimuladoService } from '../../services/simulado.service';
import { Questao } from '../../models/questao.model';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';

@Component({
  selector: 'app-simulados',
  standalone: true,
  imports: [CommonModule, DashboardLayout, RouterModule],
  templateUrl: './simulados.html',
  styleUrls: ['./simulados.css']
})
export class Simulados implements OnInit {
  private simuladoService = inject(SimuladoService);
  private route = inject(ActivatedRoute);

  questoes: Questao[] = [];
  licaoId: number | null = null;
  loading = true;
  error = '';

  questaoAtual = 0;
  respostas: { [key: number]: string } = {};
  simuladoFinalizado = false;
  pontuacao = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('licaoId');
      if (id) {
        this.licaoId = +id;
        this.carregarQuestoes();
      } else {
        this.error = 'ID da lição não fornecido.';
        this.loading = false;
      }
    });
  }

  carregarQuestoes() {
    if (!this.licaoId) return;

    this.simuladoService.getQuestoesSimulado(this.licaoId).subscribe({
      next: (data) => {
        this.questoes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load questões. Backend might not be running.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  selecionarAlternativa(alternativa: string) {
    if (this.simuladoFinalizado) return;
    this.respostas[this.questaoAtual] = alternativa;
  }

  proximaQuestao() {
    if (this.questaoAtual < this.questoes.length - 1) {
      this.questaoAtual++;
    }
  }

  questaoAnterior() {
    if (this.questaoAtual > 0) {
      this.questaoAtual--;
    }
  }

  finalizarSimulado() {
    this.simuladoFinalizado = true;
    this.calcularPontuacao();
  }

  calcularPontuacao() {
    this.pontuacao = 0;
    this.questoes.forEach((questao, index) => {
      if (this.respostas[index] === questao.respostaCorreta) {
        this.pontuacao++;
      }
    });
  }
}
