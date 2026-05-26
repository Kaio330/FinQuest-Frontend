import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  form: FormGroup = this.fb.group({
    nomePlayer: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]]
  });

  carregando = signal(false);
  erro = signal('');
  etapa = signal<'form' | 'sucesso'>('form');

  get nomeCtrl() { return this.form.get('nomePlayer')!; }
  get emailCtrl() { return this.form.get('email')!; }
  get senhaCtrl() { return this.form.get('senha')!; }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.erro.set('');

    const { nomePlayer, email, senha } = this.form.value;

    this.http.post(`${environment.apiUrl}/jogadores/cadastrar`, { nomePlayer, email, senha }).subscribe({
      next: () => {
        // Conta criada — faz login automaticamente
        this.authService.login(email, senha).subscribe({
          next: () => {
            this.carregando.set(false);
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.carregando.set(false);
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.carregando.set(false);
        if (err.status === 0) {
          this.erro.set('Não foi possível ligar ao servidor. Verifique se o backend está ativo.');
        } else if (err.status === 400) {
          this.erro.set('Dados inválidos. Verifica os campos e tenta novamente.');
        } else if (err.status === 409 || (err.error && String(err.error).toLowerCase().includes('unique'))) {
          this.erro.set('Este e-mail já está registado. Tenta entrar na tua conta.');
        } else {
          this.erro.set('Ocorreu um erro ao criar a conta. Tenta novamente.');
        }
      }
    });
  }
}
