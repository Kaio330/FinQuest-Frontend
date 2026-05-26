import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConquistaService } from '../../services/conquista.service';
import { Conquista } from '../../models/conquista.model';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { AuthService } from '../../services/auth.service';

export interface ConquistaCatalogo {
  id: string;
  titulo: string;
  descricao: string;
  xpRecompensa: number;
  iconeCategoria: 'estrela' | 'fogo' | 'livro' | 'moeda' | 'escudo' | 'trofeu' | 'raio' | 'alvo';
  cor: 'emerald' | 'purple' | 'yellow' | 'blue' | 'rose' | 'orange';
  criterio: string;
}

const CATALOGO: ConquistaCatalogo[] = [
  { id: 'primeira_licao',   titulo: 'Primeiros Passos',      descricao: 'Completaste a tua primeira lição.',               xpRecompensa: 50,  iconeCategoria: 'estrela',  cor: 'emerald', criterio: 'Completa 1 lição' },
  { id: 'cinco_licoes',     titulo: 'Em Ritmo de Aprendiz',  descricao: 'Completaste 5 lições no total.',                 xpRecompensa: 100, iconeCategoria: 'livro',    cor: 'blue',    criterio: 'Completa 5 lições' },
  { id: 'dez_licoes',       titulo: 'Estudante Dedicado',    descricao: 'Completaste 10 lições no total.',                xpRecompensa: 200, iconeCategoria: 'livro',    cor: 'purple',  criterio: 'Completa 10 lições' },
  { id: 'nivel_2',          titulo: 'Subindo de Nível',      descricao: 'Chegaste ao nível 2.',                           xpRecompensa: 150, iconeCategoria: 'raio',     cor: 'yellow',  criterio: 'Alcança o nível 2' },
  { id: 'nivel_5',          titulo: 'Meio Caminho',          descricao: 'Chegaste ao nível 5.',                           xpRecompensa: 300, iconeCategoria: 'raio',     cor: 'orange',  criterio: 'Alcança o nível 5' },
  { id: 'sem_erros',        titulo: 'Resposta Perfeita',     descricao: 'Concluíste uma lição sem errar nenhuma questão.', xpRecompensa: 200, iconeCategoria: 'alvo',     cor: 'emerald', criterio: 'Lição sem erros' },
  { id: 'serie_3',          titulo: 'Chama Acesa',           descricao: 'Estudaste 3 dias seguidos.',                     xpRecompensa: 100, iconeCategoria: 'fogo',     cor: 'rose',    criterio: '3 dias seguidos' },
  { id: 'serie_7',          titulo: 'Semana de Fogo',        descricao: 'Mantiveste uma sequência de 7 dias.',            xpRecompensa: 300, iconeCategoria: 'fogo',     cor: 'orange',  criterio: '7 dias seguidos' },
  { id: 'xp_500',           titulo: 'Acumulador de XP',      descricao: 'Atingiste 500 XP no total.',                     xpRecompensa: 100, iconeCategoria: 'moeda',    cor: 'yellow',  criterio: 'Acumula 500 XP' },
  { id: 'xp_1000',          titulo: 'Mestre das Finanças',   descricao: 'Atingiste 1000 XP. Impressionante!',             xpRecompensa: 200, iconeCategoria: 'trofeu',   cor: 'yellow',  criterio: 'Acumula 1000 XP' },
  { id: 'simulado_1',       titulo: 'Primeiro Teste',        descricao: 'Completaste o teu primeiro simulado.',            xpRecompensa: 150, iconeCategoria: 'escudo',   cor: 'blue',    criterio: 'Completa 1 simulado' },
  { id: 'simulado_perfeito',titulo: 'Nota Máxima',           descricao: 'Tiraste 100% num simulado.',                     xpRecompensa: 400, iconeCategoria: 'trofeu',   cor: 'purple',  criterio: '100% no simulado' },
];

@Component({
  selector: 'app-conquistas',
  standalone: true,
  imports: [CommonModule, DashboardLayout],
  templateUrl: './conquistas.html',
  styleUrls: ['./conquistas.css']
})
export class Conquistas implements OnInit {
  private conquistaService = inject(ConquistaService);
  private authService = inject(AuthService);

  conquistas = signal<Conquista[]>([]);
  loading = signal(true);
  error = signal('');

  readonly catalogo = CATALOGO;

  // IDs dos títulos desbloqueados (para cruzar com o catálogo)
  titulosDesbloqueados = computed(() =>
    new Set(this.conquistas().map(c => c.titulo.toLowerCase().trim()))
  );

  conquistasDesbloqueadas = computed(() => this.conquistas());

  conquistasBloqueadas = computed(() =>
    CATALOGO.filter(c =>
      !this.conquistas().some(
        d => d.titulo.toLowerCase().trim() === c.titulo.toLowerCase().trim()
      )
    )
  );

  totalXpConquistado = computed(() =>
    this.conquistas().reduce((sum, c) => sum + (c.xpRecompensa ?? 0), 0)
  );

  percentualConcluido = computed(() => {
    if (CATALOGO.length === 0) return 0;
    return Math.round((this.conquistas().length / CATALOGO.length) * 100);
  });

  ngOnInit() {
    const jogadorId = this.authService.getJogadorId();
    this.conquistaService.getConquistas(jogadorId).subscribe({
      next: (data) => {
        this.conquistas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        // Em desenvolvimento: mostra página mesmo sem backend de conquistas
        this.conquistas.set([]);
        this.loading.set(false);
        console.warn('Endpoint de conquistas indisponível:', err);
      }
    });
  }

  formatarData(data: string): string {
    if (!data) return '';
    try {
      return new Date(data).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return data;
    }
  }

  corClasses(cor: ConquistaCatalogo['cor']): { bg: string; border: string; text: string; glow: string } {
    const map: Record<ConquistaCatalogo['cor'], { bg: string; border: string; text: string; glow: string }> = {
      emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
      purple:  { bg: 'bg-purple-500/20',  border: 'border-purple-500/40',  text: 'text-purple-400',  glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
      yellow:  { bg: 'bg-yellow-500/20',  border: 'border-yellow-500/40',  text: 'text-yellow-400',  glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]' },
      blue:    { bg: 'bg-blue-500/20',    border: 'border-blue-500/40',    text: 'text-blue-400',    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
      rose:    { bg: 'bg-rose-500/20',    border: 'border-rose-500/40',    text: 'text-rose-400',    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]' },
      orange:  { bg: 'bg-orange-500/20',  border: 'border-orange-500/40',  text: 'text-orange-400',  glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' },
    };
    return map[cor];
  }

  // Encontra o item do catálogo para uma conquista desbloqueada
  catalogoDe(conquista: Conquista): ConquistaCatalogo | undefined {
    return CATALOGO.find(c => c.titulo.toLowerCase().trim() === conquista.titulo.toLowerCase().trim());
  }
}
