import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';

interface Achievement { id: number; title: string; description: string; iconColor: string; date: string; }
interface ChatMessage { role: 'user' | 'ai'; text: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DashboardLayout],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements AfterViewChecked, OnInit {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  private authService = inject(AuthService);
  private jogadorService = inject(JogadorService);

  activeTab = signal<'overview' | 'mentor'>('overview');

  recentAchievements = signal<Achievement[]>([
    { id: 1, title: 'Primeiros Passos', description: 'Completaste a tua primeira lição.', iconColor: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-emerald-400', date: 'Há 2 dias' },
    { id: 2, title: 'Mão de Vaca',       description: 'Registou 7 dias sem gastos supérfluos.',  iconColor: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-2 border-purple-400',  date: 'Há 5 dias' }
  ]);

  // Dados do jogador (lidos do serviço reativo)
  get jogador() { return this.authService.getJogadorAtual(); }
  get xpNextLevel() { return (this.jogador?.nivelAtual ?? 1) * 100; }
  get xpPercentage() {
    const xp = this.jogador?.xpPlayer ?? 0;
    return Math.min(Math.round((xp / this.xpNextLevel) * 100), 100);
  }

  ngOnInit() {
    this.jogadorService.buscarPorId(this.authService.getJogadorId()).subscribe({
      next: d => { if (d) this.authService.atualizarSessao(d); }
    });
  }

  // ── Mentor IA ──
  chatInput = '';
  chatHistory = signal<ChatMessage[]>([]);
  isTyping = signal(false);

  @ViewChild('chatScroll') set chatScrollRef(el: ElementRef) {
    this.chatScrollContainer = el;
  }

  ngAfterViewChecked() {
    if (this.chatScrollContainer) {
      try { this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight; } catch {}
    }
  }

  private async fetchWithRetry(url: string, options: any, retries = 3): Promise<any> {
    const delays = [1000, 2000, 4000];
    for (let i = 0; i < retries; i++) {
      try {
        const r = await fetch(url, options);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.json();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }
  }

  async askMentor() {
    if (!this.chatInput.trim() || this.isTyping()) return;
    const msg = this.chatInput.trim();
    this.chatHistory.update(h => [...h, { role: 'user', text: msg }]);
    this.chatInput = '';
    this.isTyping.set(true);

    const apiKey = 'AIzaSyDRP8F3eFnv170sz2za-cNQI-c5E0_zKmE';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
      systemInstruction: { parts: [{ text: `Mentor IA do FinQuest. Usuário nível ${this.jogador?.nivelAtual ?? 1}. Respostas curtas e didáticas sobre finanças pessoais.` }] },
      contents: [{ parts: [{ text: msg }] }],
      tools: [{ google_search: {} }]
    };

    try {
      const result = await this.fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Erro de conexão. Tente novamente.';
      this.chatHistory.update(h => [...h, { role: 'ai', text: aiText }]);
    } catch {
      this.chatHistory.update(h => [...h, { role: 'ai', text: 'Não foi possível conectar ao serviço de IA.' }]);
    } finally {
      this.isTyping.set(false);
    }
  }
}
