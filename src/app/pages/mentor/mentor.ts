import { Component, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { AuthService } from '../../services/auth.service';

interface ChatMessage { role: 'user' | 'ai'; text: string; }

@Component({
  selector: 'app-mentor',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayout],
  templateUrl: './mentor.html',
  styleUrls: ['./mentor.css']
})
export class Mentor implements AfterViewChecked {
  @ViewChild('chatScroll') private chatScroll!: ElementRef;
  private authService = inject(AuthService);

  chatInput = '';
  chatHistory = signal<ChatMessage[]>([]);
  isTyping = signal(false);

  get nivel() { return this.authService.getJogadorAtual()?.nivelAtual ?? 1; }
  get nome()  { return this.authService.getJogadorAtual()?.nomePlayer ?? 'Jogador'; }

  ngAfterViewChecked() {
    if (this.chatScroll) {
      try { this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight; } catch {}
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
      systemInstruction: { parts: [{ text: `Mentor IA do FinQuest. Utilizador: ${this.nome}, nível ${this.nivel}. Responde de forma curta, didática e motivadora sobre finanças pessoais e investimentos.` }] },
      contents: [{ parts: [{ text: msg }] }],
      tools: [{ google_search: {} }]
    };

    try {
      const result = await this.fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Erro de conexão. Tenta novamente.';
      this.chatHistory.update(h => [...h, { role: 'ai', text }]);
    } catch {
      this.chatHistory.update(h => [...h, { role: 'ai', text: 'Não foi possível conectar ao serviço de IA.' }]);
    } finally {
      this.isTyping.set(false);
    }
  }
}
