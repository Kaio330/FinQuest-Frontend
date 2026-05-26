import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]]
  });

  carregando = signal(false);
  erro = signal('');
  sucesso = signal('');

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.erro.set('');

    const { email, senha } = this.loginForm.value;

    this.authService.login(email, senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.carregando.set(false);
        if (err.status === 401 || err.status === 403) {
          this.erro.set('E-mail ou palavra-passe incorretos.');
        } else if (err.status === 0) {
          this.erro.set('Não foi possível ligar ao servidor. Verifique se o backend está ativo.');
        } else {
          this.erro.set('Ocorreu um erro inesperado. Tente novamente.');
        }
      }
    });
  }
}
