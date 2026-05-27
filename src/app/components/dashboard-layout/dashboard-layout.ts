import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, JogadorSessao } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit, OnDestroy {
  @Input() title = 'Dashboard';
  @Input() subtitle = '';

  private authService = inject(AuthService);
  private jogadorService = inject(JogadorService);
  private sub = new Subscription();

  jogador: Partial<JogadorSessao> = { nomePlayer: '', nivelAtual: 1, xpPlayer: 0 };

  get xpParaProximoNivel(): number { return (this.jogador.nivelAtual ?? 1) * 100; }
  get xpPercentagem(): number {
    return Math.min(Math.round(((this.jogador.xpPlayer ?? 0) / this.xpParaProximoNivel) * 100), 100);
  }

  ngOnInit() {
    const sessao = this.authService.getJogadorAtual();
    if (sessao) this.jogador = { ...sessao };

    this.sub.add(
      this.jogadorService.buscarPorId(this.authService.getJogadorId()).subscribe({
        next: d => { if (d) { this.jogador = { ...this.jogador, ...d }; this.authService.atualizarSessao(d); } }
      })
    );

    this.sub.add(
      this.jogadorService.jogador$.subscribe({
        next: d => { if (d) this.jogador = { ...this.jogador, ...d }; }
      })
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  logout() { this.authService.logout(); window.location.href = '/login'; }
}
