import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { AuthService } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';
import { environment } from '../../../environments/environment';

interface Questao  { idQuestao: number; enunciado: string; alternativas: string[]; respostaCorreta: number; }
interface Licao    { idLicao: number; titulo: string; conteudo: string; vidasJogador: number; recompensaXP: number; recompensaCredito: number; questoes: Questao[]; }
interface Nivel    { numNivel: number; titulo: string; xpMinimo: number; licoes: Licao[]; }

@Component({
  selector: 'app-trilhas',
  standalone: true,
  imports: [CommonModule, DashboardLayout],
  templateUrl: './trilhas.html',
  styleUrls: ['./trilhas.css']
})
export class Trilhas implements OnInit {
  private http          = inject(HttpClient);
  private authService   = inject(AuthService);
  private jogadorService = inject(JogadorService);
  private apiUrl        = environment.apiUrl;

  niveis          = signal<Nivel[]>([]);
  carregando      = signal(true);
  licaoAtiva      = signal<Licao | null>(null);
  questaoIndex    = signal(0);
  resposta        = signal<number | null>(null);
  feedback        = signal<'correta' | 'incorreta' | null>(null);
  vidas           = signal(3);
  licaoConcluida  = signal(false);

  questaoAtual = computed(() => {
    const l = this.licaoAtiva();
    return l ? l.questoes[this.questaoIndex()] : null;
  });

  progressoLicao = computed(() => {
    const l = this.licaoAtiva();
    return l ? (this.questaoIndex() / l.questoes.length) * 100 : 0;
  });

  ngOnInit() { this.carregarDados(); }

  carregarDados() {
    forkJoin({
      niveis: this.http.get<any[]>(`${this.apiUrl}/niveis/listar`),
      licoes: this.http.get<any[]>(`${this.apiUrl}/licoes/listar`)
    }).subscribe({
      next: ({ niveis: nd, licoes: ld }) => {
        const ids = ld.map((l: any) => l.id);
        if (!ids.length) { this.montar(nd, ld, {}); return; }

        const reqs: Record<number, any> = {};
        ids.forEach((id: number) => { reqs[id] = this.http.get<any[]>(`${this.apiUrl}/questoes/licao/${id}`); });

        forkJoin(reqs).subscribe({
          next: (qPorLicao) => this.montar(nd, ld, qPorLicao as Record<number, any[]>),
          error: ()         => this.montar(nd, ld, {})
        });
      },
      error: () => { this.carregarMockados(); this.carregando.set(false); }
    });
  }

  private montar(nd: any[], ld: any[], qPorLicao: Record<number, any[]>) {
    const niveis: Nivel[] = nd.map(n => ({
      numNivel: n.numeroNivel,
      titulo:   n.titulo,
      xpMinimo: n.xpMinimo ?? 0,
      licoes:   ld.filter((l: any) => l.nivelId === n.id).map((l: any) => ({
        idLicao:         l.id,
        titulo:          l.titulo,
        conteudo:        l.conteudo,
        vidasJogador:    3,
        recompensaXP:    l.xpRecompensa ?? 100,
        recompensaCredito: l.moedaRecompensa ?? 25,
        questoes: (qPorLicao[l.id] ?? []).map((q: any) => ({
          idQuestao:       q.id,
          enunciado:       q.enunciado,
          alternativas:    [q.alternativaA, q.alternativaB, q.alternativaC, q.alternativaD].filter(Boolean),
          respostaCorreta: ['A','B','C','D'].indexOf(q.respostaCorreta)
        }))
      }))
    }));
    niveis.sort((a, b) => a.numNivel - b.numNivel);
    this.niveis.set(niveis);
    this.carregando.set(false);
  }

  iniciarLicao(licao: Licao) {
    this.licaoAtiva.set(licao);
    this.vidas.set(licao.vidasJogador);
    this.questaoIndex.set(0);
    this.resposta.set(null);
    this.feedback.set(null);
    this.licaoConcluida.set(false);
  }

  sairLicao() { this.licaoAtiva.set(null); }

  selecionarAlternativa(i: number) {
    if (this.feedback() !== null) return;
    this.resposta.set(i);
  }

  confirmarResposta() {
    const sel = this.resposta();
    if (sel === null) return;
    const q = this.questaoAtual();
    if (sel === q?.respostaCorreta) {
      this.feedback.set('correta');
    } else {
      this.feedback.set('incorreta');
      this.vidas.update(v => v - 1);
      if (this.vidas() <= 0) { alert('Ficaste sem vidas! A lição será reiniciada.'); this.sairLicao(); }
    }
  }

  proximaQuestao() {
    const next = this.questaoIndex() + 1;
    const l = this.licaoAtiva();
    if (l && next < l.questoes.length) {
      this.questaoIndex.set(next);
      this.resposta.set(null);
      this.feedback.set(null);
    } else {
      this.licaoConcluida.set(true);
    }
  }

  finalizarEvolucao() {
    const licao = this.licaoAtiva();
    this.sairLicao();
    if (!licao) return;

    const jogadorId = this.authService.getJogadorId();

    // Persiste XP
    this.jogadorService.darXp(jogadorId, licao.recompensaXP).subscribe({
      next: (j) => this.authService.atualizarSessao({ xpPlayer: j.xpPlayer, nivelAtual: j.nivelAtual }),
      error: (e) => console.error('Erro ao guardar XP:', e)
    });

    // Persiste moedas
    this.http.put(`${this.apiUrl}/carteiras/adicionar/${jogadorId}?valor=${licao.recompensaCredito}`, {})
      .subscribe({ error: e => console.warn('Carteira:', e) });
  }

  private carregarMockados() {
    this.niveis.set([{
      numNivel: 1, titulo: 'Introdução à Economia Pessoal', xpMinimo: 0,
      licoes: [
        { idLicao: 101, titulo: 'O Valor do Dinheiro', conteudo: 'Aprenda os conceitos básicos de ganhos, gastos e o que significa poupar de verdade.', vidasJogador: 3, recompensaXP: 100, recompensaCredito: 25,
          questoes: [{ idQuestao: 1, enunciado: 'O que representa o conceito de "Reserva de Emergência"?', alternativas: ['Dinheiro para viagens.','Valor poupado para gastos imprevistos.','Limite do cartão de crédito.','Montante na bolsa de valores.'], respostaCorreta: 1 }] },
        { idLicao: 102, titulo: 'Despesas Invisíveis', conteudo: 'Como aqueles pequenos gastos diários estão a corroer a sua riqueza.', vidasJogador: 3, recompensaXP: 150, recompensaCredito: 30,
          questoes: [{ idQuestao: 2, enunciado: 'O que são "gastos formiga"?', alternativas: ['Taxas bancárias anuais.','Grandes compras parceladas.','Pequenos gastos diários quase imperceptíveis.','Impostos não declarados.'], respostaCorreta: 2 }] }
      ]
    }]);
  }
}
