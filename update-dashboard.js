const fs = require('fs');
let code = fs.readFileSync('src/app/pages/dashboard/dashboard.ts', 'utf8');

const importToReplace = `import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';`;
const importReplacement = `import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked, OnInit, inject } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';`;

code = code.replace(importToReplace, importReplacement);

const newInterfaces = `
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

`;

code = code.replace(`interface ChatMessage { role: 'user' | 'ai'; text: string; }`, `interface ChatMessage { role: 'user' | 'ai'; text: string; }\n` + newInterfaces);

const classStartToReplace = `export class DashboardComponent implements AfterViewChecked {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  // Estado UI
  activeTab = signal<string>('dashboard');`;

const classStartReplacement = `export class DashboardComponent implements AfterViewChecked, OnInit {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  // Estado UI
  activeTab = signal<string>('dashboard');

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
  }`;

code = code.replace(classStartToReplace, classStartReplacement);

fs.writeFileSync('src/app/pages/dashboard/dashboard.ts', code);
