import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, JogadorSessao } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';

  private authService = inject(AuthService);
  private jogadorService = inject(JogadorService);

  jogador: Partial<JogadorSessao> = {
    nomePlayer: 'Carregando...',
    nivelAtual: 1,
    xpPlayer: 0,
    vidasJogador: 3
  };

  ngOnInit() {
    // Inicia imediatamente com dados da sessão
    const sessao = this.authService.getJogadorAtual();
    if (sessao) {
      this.jogador = { ...sessao };
    }

    // Atualiza com dados frescos do backend
    const jogadorId = this.authService.getJogadorId();
    this.jogadorService.buscarPorId(jogadorId).subscribe({
      next: (data) => {
        if (data) this.jogador = { ...this.jogador, ...data };
      },
      error: (err) => console.error('Erro ao buscar dados do jogador:', err)
    });
  }
}
