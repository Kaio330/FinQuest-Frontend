import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService, JogadorSessao } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle: string = '';

  private authService = inject(AuthService);
  private jogadorService = inject(JogadorService);
  private sub = new Subscription();

  jogador: Partial<JogadorSessao> = {
    nomePlayer: 'Carregando...',
    nivelAtual: 1,
    xpPlayer: 0,
    vidasJogador: 3
  };

  get xpParaProximoNivel(): number {
    return (this.jogador.nivelAtual ?? 1) * 100;
  }

  get xpPercentagem(): number {
    const xp = this.jogador.xpPlayer ?? 0;
    return Math.min(Math.round((xp / this.xpParaProximoNivel) * 100), 100);
  }

  ngOnInit() {
    // Carrega imediatamente da sessão
    const sessao = this.authService.getJogadorAtual();
    if (sessao) this.jogador = { ...sessao };

    // Busca dados frescos do backend
    const jogadorId = this.authService.getJogadorId();
    this.sub.add(
      this.jogadorService.buscarPorId(jogadorId).subscribe({
        next: (data) => {
          if (data) {
            this.jogador = { ...this.jogador, ...data };
            this.authService.atualizarSessao(data);
          }
        },
        error: (err) => console.error('Erro ao buscar dados do jogador:', err)
      })
    );

    // Reage a atualizações em tempo real (ex: fim de lição)
    this.sub.add(
      this.jogadorService.jogador$.subscribe({
        next: (data) => {
          if (data) this.jogador = { ...this.jogador, ...data };
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
