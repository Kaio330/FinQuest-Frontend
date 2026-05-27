import { Component, Input, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService, JogadorSessao } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';
import { environment } from '../../../environments/environment';

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

  private authService   = inject(AuthService);
  private jogadorService = inject(JogadorService);
  private http          = inject(HttpClient);
  private sub = new Subscription();

  jogador: Partial<JogadorSessao> = { nomePlayer: '', nivelAtual: 1, xpPlayer: 0 };
  moedas          = signal(0);
  sidebarAberta   = signal(false);
  perfilAberto    = signal(false);

  get xpParaProximoNivel(): number { return (this.jogador.nivelAtual ?? 1) * 100; }
  get xpPercentagem(): number {
    return Math.min(Math.round(((this.jogador.xpPlayer ?? 0) / this.xpParaProximoNivel) * 100), 100);
  }

  ngOnInit() {
    const sessao = this.authService.getJogadorAtual();
    if (sessao) this.jogador = { ...sessao };

    const id = this.authService.getJogadorId();

    this.sub.add(
      this.jogadorService.buscarPorId(id).subscribe({
        next: d => { if (d) { this.jogador = { ...this.jogador, ...d }; this.authService.atualizarSessao(d); } }
      })
    );

    this.sub.add(
      this.jogadorService.jogador$.subscribe({
        next: d => { if (d) this.jogador = { ...this.jogador, ...d }; }
      })
    );

    // Busca saldo da carteira
    this.http.get<any>(`${environment.apiUrl}/carteiras/${id}`).subscribe({
      next: c => this.moedas.set(c?.creditosTotais ?? 0),
      error: () => {}
    });
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  logout() { this.authService.logout(); window.location.href = '/login'; }

  toggleSidebar()  { this.sidebarAberta.update(v => !v); }
  fecharSidebar()  { this.sidebarAberta.set(false); }
  togglePerfil()   { this.perfilAberto.update(v => !v); }
  fecharPerfil()   { this.perfilAberto.set(false); }
}
