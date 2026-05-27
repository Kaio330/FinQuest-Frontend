import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { AuthService } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';
import { environment } from '../../../environments/environment';

interface Termo    { id: number; nome: string; definicao: string; exemplo?: string; ordem: number; }
interface Questao  { idQuestao: number; enunciado: string; alternativas: string[]; respostaCorreta: number; }
interface Licao    { idLicao: number; titulo: string; conteudo: string; vidasJogador: number; recompensaXP: number; recompensaCredito: number; questoes: Questao[]; termos: Termo[]; }
interface Nivel    { numNivel: number; titulo: string; xpMinimo: number; licoes: Licao[]; }

type Fase = 'aula' | 'quiz' | 'concluida';

@Component({
  selector: 'app-trilhas',
  standalone: true,
  imports: [CommonModule, DashboardLayout],
  templateUrl: './trilhas.html',
  styleUrls: ['./trilhas.css']
})
export class Trilhas implements OnInit {
  private http           = inject(HttpClient);
  private authService    = inject(AuthService);
  private jogadorService = inject(JogadorService);
  private apiUrl         = environment.apiUrl;

  niveis         = signal<Nivel[]>([]);
  carregando     = signal(true);
  licaoAtiva     = signal<Licao | null>(null);
  fase           = signal<Fase>('aula');

  // Quiz state
  questaoIndex   = signal(0);
  resposta       = signal<number | null>(null);
  feedback       = signal<'correta' | 'incorreta' | null>(null);
  vidas          = signal(3);

  // Aula state
  termoAtivo     = signal<number>(0);

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
        if (!ids.length) { this.montar(nd, ld, {}, {}); return; }

        const questaoReqs: Record<number, any> = {};
        const termoReqs:   Record<number, any> = {};
        ids.forEach((id: number) => {
          questaoReqs[id] = this.http.get<any[]>(`${this.apiUrl}/questoes/licao/${id}`).pipe(catchError(() => of([])));
          termoReqs[id]   = this.http.get<any[]>(`${this.apiUrl}/termos/licao/${id}`).pipe(catchError(() => of([])));
        });

        forkJoin({
          questoes: forkJoin(questaoReqs),
          termos:   forkJoin(termoReqs)
        }).subscribe({
          next: ({ questoes, termos }) =>
            this.montar(nd, ld, questoes as Record<number, any[]>, termos as Record<number, any[]>),
          error: () => this.montar(nd, ld, {}, {})
        });
      },
      error: () => { this.carregarMockados(); this.carregando.set(false); }
    });
  }

  private montar(nd: any[], ld: any[], qPorLicao: Record<number, any[]>, tPorLicao: Record<number, any[]>) {
    const niveis: Nivel[] = nd.map(n => ({
      numNivel: n.numeroNivel,
      titulo:   n.titulo,
      xpMinimo: (n.numeroNivel - 1) * 100,
      licoes:   ld.filter((l: any) => l.nivelId === n.id).map((l: any) => ({
        idLicao:           l.id,
        titulo:            l.titulo,
        conteudo:          l.conteudo ?? '',
        vidasJogador:      3,
        recompensaXP:      l.xpRecompensa    ?? 100,
        recompensaCredito: l.moedaRecompensa ?? 25,
        termos: (tPorLicao[l.id] ?? []).map((t: any) => ({
          id:       t.id,
          nome:     t.nome,
          definicao: t.definicao,
          exemplo:  t.exemplo ?? null,
          ordem:    t.ordem   ?? 0
        })),
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

  // ── Iniciar ──────────────────────────────────────────────────────────────
  iniciarLicao(licao: Licao, nivelXpMinimo: number = 0) {
    const xpAtual = this.authService.getJogadorAtual()?.xpPlayer ?? 0;
    if (xpAtual < nivelXpMinimo) {
      alert(`Você precisa de ${nivelXpMinimo} XP para aceder a esta lição. Você tem ${xpAtual} XP.`);
      return;
    }
    this.licaoAtiva.set(licao);
    this.vidas.set(licao.vidasJogador);
    this.questaoIndex.set(0);
    this.resposta.set(null);
    this.feedback.set(null);
    this.termoAtivo.set(0);
    const temAula = (licao.conteudo?.trim().length > 0) || (licao.termos.length > 0);
    this.fase.set(temAula ? 'aula' : 'quiz');
  }

  sairLicao() { this.licaoAtiva.set(null); }

  // ── Aula ─────────────────────────────────────────────────────────────────
  avancarTermo() {
    const l = this.licaoAtiva();
    if (!l) return;
    if (this.termoAtivo() < l.termos.length - 1) this.termoAtivo.update(v => v + 1);
  }

  recuarTermo() {
    if (this.termoAtivo() > 0) this.termoAtivo.update(v => v - 1);
  }

  iniciarQuiz() {
    this.questaoIndex.set(0);
    this.resposta.set(null);
    this.feedback.set(null);
    this.fase.set('quiz');
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
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
      if (this.vidas() <= 0) {
        alert('Ficaste sem vidas! A lição será reiniciada.');
        this.sairLicao();
      }
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
      this.fase.set('concluida');
    }
  }

  // ── Finalizar ─────────────────────────────────────────────────────────────
  finalizarEvolucao() {
    const licao = this.licaoAtiva();
    this.sairLicao();
    if (!licao) return;

    const jogadorId = this.authService.getJogadorId();

    this.jogadorService.darXp(jogadorId, licao.recompensaXP).subscribe({
      next: (j) => this.authService.atualizarSessao({ xpPlayer: j.xpPlayer, nivelAtual: j.nivelAtual }),
      error: (e) => console.error('Erro ao guardar XP:', e)
    });

    this.http.put(`${this.apiUrl}/carteiras/adicionar/${jogadorId}?valor=${licao.recompensaCredito}`, {})
      .subscribe({ error: e => console.warn('Carteira:', e) });
  }

  // ── Mock ──────────────────────────────────────────────────────────────────
  private carregarMockados() {
    this.niveis.set([{
      numNivel: 1, titulo: 'Introdução à Economia Pessoal', xpMinimo: 0,
      licoes: [
        {
          idLicao: 101, titulo: 'O Valor do Dinheiro', vidasJogador: 3, recompensaXP: 100, recompensaCredito: 25,
          conteudo: 'Dinheiro é um meio de troca aceite por todos numa economia. Entender o seu valor é o primeiro passo para gerir bem as finanças pessoais.',
          termos: [
            { id: 1, nome: 'Reserva de Emergência', definicao: 'Valor poupado para cobrir gastos imprevistos, como problemas de saúde ou perda de emprego.', exemplo: 'Poupar 3 a 6 meses de despesas mensais numa conta separada.', ordem: 0 },
            { id: 2, nome: 'Liquidez', definicao: 'Facilidade com que um ativo pode ser convertido em dinheiro sem perda de valor.', exemplo: 'Dinheiro em conta à ordem tem alta liquidez; um imóvel tem baixa liquidez.', ordem: 1 },
            { id: 3, nome: 'Orçamento Pessoal', definicao: 'Plano que organiza receitas e despesas para um período, ajudando a controlar o dinheiro.', exemplo: 'Registar salário, renda, alimentação e separar o restante para poupança.', ordem: 2 }
          ],
          questoes: [{ idQuestao: 1, enunciado: 'O que representa o conceito de "Reserva de Emergência"?', alternativas: ['Dinheiro para viagens.','Valor poupado para gastos imprevistos.','Limite do cartão de crédito.','Montante na bolsa de valores.'], respostaCorreta: 1 }]
        }
      ]
    }]);
  }
}
