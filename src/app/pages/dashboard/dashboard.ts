import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked, OnInit, inject } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  private apiUrl = 'http://localhost:8080';

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
    this.carregarDadosDoBackEnd();
  }

  mudarAba(aba: string) {
    this.activeTab.set(aba);
    if (aba === 'trilhas') {
      this.sairLicao();
    }
  }

  carregarDadosDoBackEnd() {
    this.http.get<any[]>(this.apiUrl + '/niveis/listar').subscribe({
      next: (niveisData) => {
        const niveisFormatados = niveisData.map(n => ({
          numNivel: n.numeroNivel,
          titulo: n.titulo,
          xpMinimo: 0,
          licoes: [] // licoes serão carregadas separadamente
        }));
        this.niveis.set(niveisFormatados);

        // Fetch licoes for each nivel
        niveisData.forEach(n => {
           this.http.get<any[]>(this.apiUrl + '/licoes/listar').subscribe({
             next: (licoesData) => {
               const licoesDoNivel = licoesData.filter(l => l.nivelId === n.id);
               const licoesComQuestoesPromises = licoesDoNivel.map(l => {
                 return new Promise<Licao>((resolve) => {
                    this.http.get<any[]>(this.apiUrl + '/questoes/licao/' + l.id).subscribe({
                      next: (questoesData) => {
                         resolve({
                           idLicao: l.id,
                           titulo: l.titulo,
                           conteudo: l.conteudo,
                           vidasJogador: 3,
                           recompensaXP: 100,
                           recompensaCredito: 25,
                           questoes: questoesData.map(q => ({
                             idQuestao: q.id,
                             enunciado: q.enunciado,
                             alternativas: [q.alternativaA, q.alternativaB, q.alternativaC, q.alternativaD].filter(Boolean),
                             respostaCorreta: ['A', 'B', 'C', 'D'].indexOf(q.respostaCorreta)
                           }))
                         });
                      }
                    });
                 });
               });

               Promise.all(licoesComQuestoesPromises).then(licoesFormatadas => {
                  this.niveis.update(currentNiveis => {
                     const nivelIndex = currentNiveis.findIndex(cn => cn.numNivel === n.numeroNivel);
                     if (nivelIndex !== -1) {
                        const updatedNiveis = [...currentNiveis];
                        updatedNiveis[nivelIndex].licoes = licoesFormatadas;
                        return updatedNiveis;
                     }
                     return currentNiveis;
                  });
               });
             }
           });
        });
      },
      error: (err) => {
        console.error('Erro ao carregar níveis do backend', err);
        // Fallback to mock data if backend fails
        this.carregarNiveisMockados();
      }
    });
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
        licoes: [] // Futuras lições
      }
    ]);
  }

  iniciarLicao(licao: Licao) {
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
    if (licao) {
      this.user.update(u => ({
        ...u,
        xp: u.xp + licao.recompensaXP,
        coins: u.coins + licao.recompensaCredito
      }));
    }
    this.sairLicao();
  }

  // Dados do Usuário (Mock)
  user = signal<User>({
    name: 'Kaio',
    level: 5,
    xp: 2450,
    xpNextLevel: 3000,
    coins: 1250,
    streak: 7,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kaio&backgroundColor=0f172a'
  });

  xpPercentage = computed(() => Math.round((this.user().xp / this.user().xpNextLevel) * 100));

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