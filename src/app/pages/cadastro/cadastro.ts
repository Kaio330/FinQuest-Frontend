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
  private router      = inject(Router);
  private fb          = inject(FormBuilder);
  private http        = inject(HttpClient);
  private authService = inject(AuthService);

  // Etapa actual: 1 = dados pessoais, 2 = endereço
  etapa = signal<1 | 2>(1);

  // Formulário unificado
  form: FormGroup = this.fb.group({
    // Etapa 1
    nomePlayer:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    email:       ['', [Validators.required, Validators.email]],
    senha:       ['', [Validators.required, Validators.minLength(4)]],
    // Etapa 2 — endereço
    cep:         ['', [Validators.required, Validators.pattern(/^\d{8}$|^\d{5}-\d{3}$/)]],
    logradouro:  ['', Validators.required],
    numero:      ['', Validators.required],
    complemento: [''],
    bairro:      ['', Validators.required],
    cidade:      ['', Validators.required],
    estado:      ['', Validators.required],
  });

  carregando    = signal(false);
  buscandoCep   = signal(false);
  erroCep       = signal('');
  erro          = signal('');
  cepEncontrado = signal(false);

  // Getters etapa 1
  get nomeCtrl()  { return this.form.get('nomePlayer')!; }
  get emailCtrl() { return this.form.get('email')!; }
  get senhaCtrl() { return this.form.get('senha')!; }

  // Getters etapa 2
  get cepCtrl()         { return this.form.get('cep')!; }
  get logradouroCtrl()  { return this.form.get('logradouro')!; }
  get numeroCtrl()      { return this.form.get('numero')!; }
  get complementoCtrl() { return this.form.get('complemento')!; }
  get bairroCtrl()      { return this.form.get('bairro')!; }
  get cidadeCtrl()      { return this.form.get('cidade')!; }
  get estadoCtrl()      { return this.form.get('estado')!; }

  // ── Etapa 1 → 2 ──────────────────────────────────────────
  avancarParaEndereco() {
    this.nomeCtrl.markAsTouched();
    this.emailCtrl.markAsTouched();
    this.senhaCtrl.markAsTouched();
    if (this.nomeCtrl.invalid || this.emailCtrl.invalid || this.senhaCtrl.invalid) return;
    this.erro.set('');
    this.etapa.set(2);
  }

  voltarParaDados() {
    this.etapa.set(1);
  }

  // ── Busca de CEP via ViaCEP ───────────────────────────────
  buscarCep() {
    const raw = this.cepCtrl.value?.replace(/\D/g, '');
    if (!raw || raw.length !== 8) {
      this.erroCep.set('Digite um CEP válido com 8 dígitos.');
      return;
    }

    this.buscandoCep.set(true);
    this.erroCep.set('');
    this.cepEncontrado.set(false);

    this.http.get<any>(`https://viacep.com.br/ws/${raw}/json/`).subscribe({
      next: (data) => {
        this.buscandoCep.set(false);
        if (data.erro) {
          this.erroCep.set('CEP não encontrado. Verifique e tente novamente.');
          this.limparEndereco();
          return;
        }
        this.form.patchValue({
          logradouro: data.logradouro ?? '',
          bairro:     data.bairro    ?? '',
          cidade:     data.localidade ?? '',
          estado:     data.uf         ?? '',
          cep:        raw
        });
        this.cepEncontrado.set(true);
        // Foca no campo número após preencher
        setTimeout(() => document.getElementById('numero-input')?.focus(), 100);
      },
      error: () => {
        this.buscandoCep.set(false);
        this.erroCep.set('Não foi possível consultar o CEP. Verifique a sua conexão.');
      }
    });
  }

  onCepKeyup(event: KeyboardEvent) {
    const raw = this.cepCtrl.value?.replace(/\D/g, '');
    if (raw?.length === 8) this.buscarCep();
    if (raw?.length < 8) {
      this.cepEncontrado.set(false);
      this.erroCep.set('');
    }
  }

  private limparEndereco() {
    this.form.patchValue({ logradouro: '', bairro: '', cidade: '', estado: '' });
    this.cepEncontrado.set(false);
  }

  // ── Submeter ──────────────────────────────────────────────
  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.carregando.set(true);
    this.erro.set('');

    const v = this.form.value;
    const payload = {
      nomePlayer:  v.nomePlayer,
      email:       v.email,
      senha:       v.senha,
      cep:         v.cep?.replace(/\D/g, ''),
      logradouro:  v.logradouro,
      numero:      v.numero,
      complemento: v.complemento || null,
      bairro:      v.bairro,
      cidade:      v.cidade,
      estado:      v.estado,
    };

    this.http.post(`${environment.apiUrl}/jogadores/cadastrar`, payload).subscribe({
      next: () => {
        this.authService.login(v.email, v.senha).subscribe({
          next:  () => { this.carregando.set(false); this.router.navigate(['/dashboard']); },
          error: () => { this.carregando.set(false); this.router.navigate(['/login']); }
        });
      },
      error: (err) => {
        this.carregando.set(false);
        if (err.status === 0) {
          this.erro.set('Não foi possível ligar ao servidor. Verifique se o backend está ativo.');
        } else if (err.status === 409 || (err.error && String(err.error).toLowerCase().includes('unique'))) {
          this.erro.set('Este e-mail já está registado. Tenta entrar na tua conta.');
          this.etapa.set(1);
        } else {
          this.erro.set('Ocorreu um erro ao criar a conta. Tenta novamente.');
        }
      }
    });
  }
}
