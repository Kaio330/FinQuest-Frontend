import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';

interface User { name: string; level: number; xp: number; xpNextLevel: number; coins: number; streak: number; avatarUrl: string; }
interface Mission { id: number; title: string; module?: string; description?: string; rewardXp: number; rewardCoins: number; difficulty: string; completed: boolean; }
interface Achievement { id: number; title: string; description: string; iconColor: string; date: string; }
interface ChatMessage { role: 'user' | 'ai'; text: string; }

interface Questao {
  idQuestao: number;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: number;
}

interface Licao {
  idLicao: number;
  titulo: string;
  conteudo: string;
  vidasJogador: number;
  recompensaXP: number;
  recompensaCredito: number;
  questoes: Questao[];
}

interface Nivel {
  numNivel: number;
  titulo: string;
  xpMinimo: number;
  licoes: Licao[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements AfterViewChecked, OnInit {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private jogadorService = inject(JogadorService);
  private apiUrl = environment.apiUrl;

  // Estado UI
  activeTab = signal<string>('trilhas');

  // --- ESTADOS DO MÓDULO TRILHAS E QUIZ ---
  niveis = signal<Nivel[]>([]);
  licaoAtiva = signal<Licao | null>(null);
  questaoAtualIndex = signal<number>(0);
  respostaSelecionada = signal<number | null>(null);
  feedbackResposta = signal<'correta' | 'incorreta' | null>(null);
  vidasAtuais = signal<number>(3);
  licaoConcluida = signal<boolean>(false);

  questaoAtual = computed(() => {
    const licao = this.licaoAtiva();
    if (!licao) return null;
    return licao.questoes[this.questaoAtualIndex()];
  });

  progressoLicao = computed(() => {
    const licao = this.licaoAtiva();
    if (!licao) return 0;
    return (this.questaoAtualIndex() / licao.questoes.length) * 100;
  });

  ngOnInit() {
    const jogadorId = this.authService.getJogadorId();
    this.carregarDadosJogador(jogadorId);
    this.carregarDadosDoBackEnd();
  }

  carregarDadosJogador(id: number) {
    this.jogadorService.buscarPorId(id).subscribe({
      next: (data) => {
        if (data) {
          this.user.update(u => ({
            ...u,
            name: data.nomePlayer || u.name,
            level: data.nivelAtual || u.level,
            xp: data.xpPlayer || u.xp,
            xpNextLevel: u.xpNextLevel, // não existe no backend ainda
            coins: u.coins,             // não existe no backend ainda
            streak: u.streak,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.nomePlayer || 'User'}&backgroundColor=0f172a`
          }));
          this.authService.atualizarSessao(data);
        }
      },
      error: (err) => {
        // Fallback: usa dados da sessão se o backend falhar
        const sessao = this.authService.getJogadorAtual();
        if (sessao) {
          this.user.update(u => ({
            ...u,
            name: sessao.nomePlayer || u.name,
            level: sessao.nivelAtual || u.level,
            xp: sessao.xpPlayer || u.xp,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessao.nomePlayer || 'User'}&backgroundColor=0f172a`
          }));
        }
        console.error('Erro ao buscar dados do jogador:', err);
      }
    });
  }

  mudarAba(aba: string) {
    this.activeTab.set(aba);
    if (aba === 'trilhas') {
      this.sairLicao();
    }
  }

  carregarDadosDoBackEnd() {
    // Carrega níveis e lições em paralelo usando RxJS
    forkJoin({
      niveis: this.http.get<any[]>(`${this.apiUrl}/niveis/listar`),
      licoes: this.http.get<any[]>(`${this.apiUrl}/licoes/listar`)
    }).subscribe({
      next: ({ niveis: niveisData, licoes: licoesData }) => {
        // Para cada lição, precisamos buscar as questões
        const licoesPorNivel: { [nivelId: number]: any[] } = {};
        niveisData.forEach(n => {
          licoesPorNivel[n.id] = licoesData.filter(l => l.nivelId === n.id);
        });

        const todasLicoesIds = licoesData.map(l => l.id);

        if (todasLicoesIds.length === 0) {
          this.montarNiveisComLicoes(niveisData, licoesData, {});
          return;
        }

        // Busca questões de todas as lições em paralelo
        const questoesRequests: { [licaoId: number]: any } = {};
        todasLicoesIds.forEach(id => {
          questoesRequests[id] = this.http.get<any[]>(`${this.apiUrl}/questoes/licao/${id}`);
        });

        forkJoin(questoesRequests).subscribe({
          next: (questoesPorLicao) => {
            this.montarNiveisComLicoes(niveisData, licoesData, questoesPorLicao as { [licaoId: number]: any[] });
          },
          error: () => {
            // Se falhar ao buscar questões, monta sem elas
            this.montarNiveisComLicoes(niveisData, licoesData, {});
          }
        });
      },
      error: (err) => {
        console.error('Erro ao carregar dados do backend', err);
        this.carregarNiveisMockados();
      }
    });
  }

  private montarNiveisComLicoes(
    niveisData: any[],
    licoesData: any[],
    questoesPorLicao: { [licaoId: number]: any[] }
  ) {
    const niveisFormatados: Nivel[] = niveisData.map(n => {
      const licoesDoNivel = licoesData.filter(l => l.nivelId === n.id);
      const licoesFormatadas: Licao[] = licoesDoNivel.map(l => ({
        idLicao: l.id,
        titulo: l.titulo,
        conteudo: l.conteudo,
        vidasJogador: 3,
        recompensaXP: l.xpRecompensa || 100,
        recompensaCredito: l.moedaRecompensa || 25,
        questoes: (questoesPorLicao[l.id] || []).map((q: any) => ({
          idQuestao: q.id,
          enunciado: q.enunciado,
          alternativas: [q.alternativaA, q.alternativaB, q.alternativaC, q.alternativaD].filter(Boolean),
          respostaCorreta: ['A', 'B', 'C', 'D'].indexOf(q.respostaCorreta)
        }))
      }));

      return {
        numNivel: n.numeroNivel,
        titulo: n.titulo,
        xpMinimo: (n.numeroNivel - 1) * 100,
        licoes: licoesFormatadas
      };
    });

    // Ordena por número de nível
    niveisFormatados.sort((a, b) => a.numNivel - b.numNivel);
    this.niveis.set(niveisFormatados);
  }

  carregarNiveisMockados() {
    this.niveis.set([
      {
        numNivel: 1,
        titulo: 'Introdução à Economia Pessoal',
        xpMinimo: 0,
        licoes: [
          {
            idLicao: 101,
            titulo: 'O Valor do Dinheiro',
            conteudo: 'Aprenda os conceitos básicos de ganhos, gastos e o que significa poupar de verdade.',
            vidasJogador: 3,
            recompensaXP: 100,
            recompensaCredito: 25,
            questoes: [
              {
                idQuestao: 1,
                enunciado: 'O que representa o conceito de "Reserva de Emergência"?',
                alternativas: [
                  'Dinheiro guardado para viajar nas férias.',
                  'Um valor poupado estritamente para gastos imprevistos e urgentes.',
                  'O limite disponível do seu cartão de crédito.',
                  'O montante investido na bolsa de valores.'
                ],
                respostaCorreta: 1
              },
              {
                idQuestao: 2,
                enunciado: 'Qual a principal diferença entre um ativo e um passivo?',
                alternativas: [
                  'Ativos colocam dinheiro no seu bolso, passivos tiram dinheiro do seu bolso.',
                  'Não existe diferença, ambos são obrigações fiscais.',
                  'Passivos são investimentos, ativos são despesas.',
                  'Ativos são apenas imóveis físicos.'
                ],
                respostaCorreta: 0
              }
            ]
          },
          {
            idLicao: 102,
            titulo: 'Despesas Invisíveis',
            conteudo: 'Como aqueles pequenos gastos diários estão a corroer a sua riqueza.',
            vidasJogador: 3,
            recompensaXP: 150,
            recompensaCredito: 30,
            questoes: [
              {
                idQuestao: 3,
                enunciado: 'O que são "gastos invisíveis" ou "gastos formiga"?',
                alternativas: [
                  'Taxas cobradas pelo banco anualmente.',
                  'Grandes compras divididas em muitas parcelas.',
                  'Pequenos gastos diários quase imperceptíveis que somados pesam no orçamento final.',
                  'Impostos não declarados.'
                ],
                respostaCorreta: 2
              }
            ]
          }
        ]
      },
      {
        numNivel: 2,
        titulo: 'Mergulho nos Investimentos',
        xpMinimo: 1000,
        licoes: []
      }
    ]);
  }

 iniciarLicao(licao: Licao, nivelXpMinimo: number) {
  const xpAtual = this.user().xp;
  if (xpAtual < nivelXpMinimo) {
    alert(`Você precisa de ${nivelXpMinimo} XP para acessar esta lição. Você tem ${xpAtual} XP.`);
    return;
  }
  this.licaoAtiva.set(licao);
  this.vidasAtuais.set(licao.vidasJogador);
  this.questaoAtualIndex.set(0);
  this.respostaSelecionada.set(null);
  this.feedbackResposta.set(null);
  this.licaoConcluida.set(false);
}

  sairLicao() {
    this.licaoAtiva.set(null);
  }

  selecionarAlternativa(index: number) {
    if (this.feedbackResposta() !== null) return;
    this.respostaSelecionada.set(index);
  }

  confirmarResposta() {
    const selecionada = this.respostaSelecionada();
    if (selecionada === null) return;

    const questao = this.questaoAtual();
    if (selecionada === questao?.respostaCorreta) {
      this.feedbackResposta.set('correta');
    } else {
      this.feedbackResposta.set('incorreta');
      this.vidasAtuais.update(v => v - 1);

      if (this.vidasAtuais() <= 0) {
        alert("Ficou sem vidas! A lição será reiniciada.");
        this.sairLicao();
      }
    }
  }

  proximaQuestao() {
    const proxIndex = this.questaoAtualIndex() + 1;
    const licao = this.licaoAtiva();

    if (licao && proxIndex < licao.questoes.length) {
      this.questaoAtualIndex.set(proxIndex);
      this.respostaSelecionada.set(null);
      this.feedbackResposta.set(null);
    } else {
      this.licaoConcluida.set(true);
    }
  }

 finalizarEvolucao() {
  const licao = this.licaoAtiva();
  if (!licao) return;

  const jogadorId = this.authService.getJogadorId();

  this.http.post<any>(`${this.apiUrl}/questoes/${licao.questoes[0].idQuestao}/responder`, {
    jogadorId: jogadorId,
    resposta: 'A'
  }).subscribe();

  this.http.put<any>(`${this.apiUrl}/jogadores/${jogadorId}/xp`, {
    xp: licao.recompensaXP
  }).subscribe({
    next: (jogadorAtualizado) => {
      this.user.update(u => ({
        ...u,
        xp: jogadorAtualizado.xpPlayer,
        level: jogadorAtualizado.nivelAtual,
        xpNextLevel: jogadorAtualizado.nivelAtual * 100,
        coins: u.coins + licao.recompensaCredito
      }));
      this.authService.atualizarSessao(jogadorAtualizado);
    },
    error: () => {
      // fallback local
      this.user.update(u => ({
        ...u,
        xp: u.xp + licao.recompensaXP,
        coins: u.coins + licao.recompensaCredito
      }));
    }
  });

  this.sairLicao();
}

  // Dados do Usuário (inicia com dados da sessão armazenada e depois atualiza do backend)
  user = signal<User>(this.buildUserFromSessao());

  private buildUserFromSessao(): User {
    const sessao = this.authService.getJogadorAtual();
    return {
      name: sessao?.nomePlayer || 'Carregando...',
      level: sessao?.nivelAtual || 1,
      xp: sessao?.xpPlayer || 0,
      xpNextLevel: 100,  // calculado localmente: nivel * 100
      coins: 0,
      streak: 0,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessao?.nomePlayer || 'User'}&backgroundColor=0f172a`
    };
  }

  xpPercentage = computed(() => {
    const nextLevel = this.user().xpNextLevel;
    if (!nextLevel || nextLevel === 0) return 0;
    return Math.round((this.user().xp / nextLevel) * 100);
  });

  // GEMINI API: Funcionalidade 1 - Missão Bônus
  generatedBonusMission = signal<Mission | null>(null);
  isGeneratingMission = signal(false);

  // GEMINI API: Funcionalidade 2 - Mentor IA (Chat)
  chatInput = '';
  chatHistory = signal<ChatMessage[]>([]);
  isTyping = signal(false);

  nextMission = signal<Mission>({
    id: 104, title: 'A Magia dos Juros Compostos', module: 'Módulo 2: Tesouro Direto', rewardXp: 500, rewardCoins: 100, difficulty: 'Médio', completed: false
  });

  recentAchievements = signal<Achievement[]>([
    { id: 1, title: 'Primeiros Passos', description: 'Você criou seu primeiro orçamento.', iconColor: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-emerald-400', date: 'Há 2 dias' },
    { id: 2, title: 'Mão de Vaca', description: 'Registrou 7 dias sem gastos supérfluos.', iconColor: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-2 border-purple-400', date: 'Há 5 dias' }
  ]);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.chatScrollContainer) {
      try {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }
  }

  private async fetchWithRetry(url: string, options: any, retries = 5): Promise<any> {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }
  }

  async generateBonusMission() {
    this.isGeneratingMission.set(true);
    const apiKey = ""; // Insira sua chave da API do Gemini aqui
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const promptText = `Crie um desafio prático de educação financeira (curto) realista para uma pessoa no nível ${this.user().level}. Concentre-se em poupança.`;

    const payload = {
      systemInstruction: { parts: [{ text: "Você atua no app FinQuest. Retorne APENAS um JSON válido sem marcações markdown." }] },
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" }, description: { type: "STRING" }, rewardXp: { type: "INTEGER" }, rewardCoins: { type: "INTEGER" }
          },
          required: ["title", "description", "rewardXp", "rewardCoins"]
        }
      }
    };

    try {
      const result = await this.fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        this.generatedBonusMission.set({ ...JSON.parse(textResponse), difficulty: 'Médio', completed: false });
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.isGeneratingMission.set(false);
    }
  }

  async askMentor() {
    if (!this.chatInput.trim() || this.isTyping()) return;

    const userMessage = this.chatInput.trim();
    this.chatHistory.update(h => [...h, { role: 'user', text: userMessage }]);
    this.chatInput = '';
    this.isTyping.set(true);

    const apiKey = "AIzaSyDRP8F3eFnv170sz2za-cNQI-c5E0_zKmE"; // Insira sua chave da API do Gemini aqui
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: { parts: [{ text: `Você é o Mentor IA do app FinQuest. O usuário é nível ${this.user().level}. Respostas curtas e didáticas.` }] },
      contents: [{ parts: [{ text: userMessage }] }],
      tools: [{ google_search: {} }]
    };

    try {
      const result = await this.fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Erro de conexão. Tente novamente.";
      this.chatHistory.update(h => [...h, { role: 'ai', text: aiResponse }]);
    } catch (err) {
      this.chatHistory.update(h => [...h, { role: 'ai', text: "Erro ao comunicar com a IA." }]);
    } finally {
      this.isTyping.set(false);
    }
  }

  acceptMission() {
    alert("Missão aceita! Cumpra o desafio para ganhar seu XP.");
    this.generatedBonusMission.set(null);
  }
}
