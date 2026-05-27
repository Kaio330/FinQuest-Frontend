import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { ObjetivoService } from '../../services/objetivo.service';
import { AuthService } from '../../services/auth.service';
import { Objetivo } from '../../models/objetivo.model';

@Component({
  selector: 'app-objetivos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayout],
  templateUrl: './objetivos.html',
  styleUrls: ['./objetivos.css']
})
export class Objetivos implements OnInit {
  private objetivoService = inject(ObjetivoService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  objetivos = signal<Objetivo[]>([]);
  loading = signal(true);
  erro = signal('');

  // Modal de criação
  mostrarModal = signal(false);
  criando = signal(false);
  erroModal = signal('');

  // Modal de progresso
  objetivoEditando = signal<Objetivo | null>(null);
  atualizando = signal(false);

  // Filtro
  filtro = signal<'todos' | 'em_progresso' | 'concluidos'>('todos');

  objetivosFiltrados = computed(() => {
    const f = this.filtro();
    const lista = this.objetivos();
    if (f === 'em_progresso') return lista.filter(o => !o.concluido);
    if (f === 'concluidos')   return lista.filter(o => o.concluido);
    return lista;
  });

  totalConcluidos  = computed(() => this.objetivos().filter(o => o.concluido).length);
  totalEmProgresso = computed(() => this.objetivos().filter(o => !o.concluido).length);
  xpTotalPossivel  = computed(() => this.objetivos().length * 50);

  // Formulário de criação
  form: FormGroup = this.fb.group({
    titulo:    ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    descricao: [''],
    valorMeta: [null, [Validators.required, Validators.min(1)]],
    prazo:     ['']
  });

  // Formulário de atualização de valor
  formProgresso: FormGroup = this.fb.group({
    valorAtual: [null, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.carregarObjetivos();
  }

  carregarObjetivos() {
    this.loading.set(true);
    const jogadorId = this.authService.getJogadorId();
    this.objetivoService.listarPorJogador(jogadorId).subscribe({
      next: (data) => {
        this.objetivos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os objetivos.');
        this.loading.set(false);
      }
    });
  }

  abrirModal() {
    this.form.reset();
    this.erroModal.set('');
    this.mostrarModal.set(true);
  }

  fecharModal() {
    this.mostrarModal.set(false);
    this.erroModal.set('');
  }

  criarObjetivo() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.criando.set(true);
    this.erroModal.set('');

    const { titulo, descricao, valorMeta, prazo } = this.form.value;
    const jogadorId = this.authService.getJogadorId();

    const payload: any = { titulo, jogadorId, valorMeta: Number(valorMeta) };
    if (descricao) payload.descricao = descricao;
    if (prazo)     payload.prazo = prazo;

    this.objetivoService.criar(payload).subscribe({
      next: (novo) => {
        this.objetivos.update(lista => [novo, ...lista]);
        this.criando.set(false);
        this.fecharModal();
      },
      error: () => {
        this.erroModal.set('Erro ao criar objetivo. Tenta novamente.');
        this.criando.set(false);
      }
    });
  }

  abrirProgresso(objetivo: Objetivo) {
    this.formProgresso.patchValue({ valorAtual: objetivo.valorAtual });
    this.objetivoEditando.set(objetivo);
  }

  fecharProgresso() {
    this.objetivoEditando.set(null);
  }

  salvarProgresso() {
    const objetivo = this.objetivoEditando();
    if (!objetivo?.id || this.formProgresso.invalid) return;

    this.atualizando.set(true);
    const novoValor = Number(this.formProgresso.value.valorAtual);

    this.objetivoService.atualizarValor(objetivo.id, novoValor).subscribe({
      next: (atualizado) => {
        this.objetivos.update(lista =>
          lista.map(o => o.id === atualizado.id ? atualizado : o)
        );
        this.atualizando.set(false);
        this.fecharProgresso();
      },
      error: () => {
        this.atualizando.set(false);
      }
    });
  }

  deletarObjetivo(id: number) {
    this.objetivoService.deletar(id).subscribe({
      next: () => this.objetivos.update(lista => lista.filter(o => o.id !== id)),
      error: () => {}
    });
  }

  percentagem(obj: Objetivo): number {
    if (!obj.valorMeta || obj.valorMeta === 0) return 0;
    return Math.min(Math.round((obj.valorAtual / obj.valorMeta) * 100), 100);
  }

  formatarData(data?: string): string {
    if (!data) return '';
    try {
      return new Date(data).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return data; }
  }

  prazoProximo(prazo?: string): boolean {
    if (!prazo) return false;
    const diff = new Date(prazo).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }

  prazoUltrapassado(prazo?: string): boolean {
    if (!prazo) return false;
    return new Date(prazo).getTime() < Date.now();
  }
}
