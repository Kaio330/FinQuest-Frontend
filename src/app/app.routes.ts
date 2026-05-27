import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { Trilhas } from './pages/trilhas/trilhas';
import { Conquistas } from './pages/conquistas/conquistas';
import { Objetivos } from './pages/objetivos/objetivos';
import { Mentor } from './pages/mentor/mentor';
import { Simulados } from './pages/simulados/simulados';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login',     component: Login },
  { path: 'cadastro',  component: Cadastro },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'trilhas',   component: Trilhas,            canActivate: [authGuard] },
  { path: 'conquistas',component: Conquistas,         canActivate: [authGuard] },
  { path: 'objetivos', component: Objetivos,          canActivate: [authGuard] },
  { path: 'mentor',    component: Mentor,             canActivate: [authGuard] },
  { path: 'simulados/:licaoId', component: Simulados, canActivate: [authGuard] },
  { path: '',          redirectTo: 'login', pathMatch: 'full' },
  { path: '**',        redirectTo: 'login' }
];
