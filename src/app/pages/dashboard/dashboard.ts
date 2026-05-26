import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleGenAI } from "@google/genai";

interface User { name: string; level: number; xp: number; xpNextLevel: number; coins: number; streak: number; avatarUrl: string; }
interface Mission { id: number; title: string; module?: string; description?: string; rewardXp: number; rewardCoins: number; difficulty: string; completed: boolean; }
interface Achievement { id: number; title: string; description: string; iconClass: string; date: string; }
interface ChatMessage { role: 'user' | 'ai'; text: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements AfterViewChecked {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  // Estado UI
  activeTab = signal<string>('dashboard');

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
    { id: 1, title: 'Primeiros Passos', description: 'Você criou seu primeiro orçamento.', iconClass: 'icon-emerald', date: 'Há 2 dias' },
    { id: 2, title: 'Mão de Vaca', description: 'Registrou 7 dias sem gastos supérfluos.', iconClass: 'icon-purple', date: 'Há 5 dias' }
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