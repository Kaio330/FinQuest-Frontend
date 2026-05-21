import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Inicio } from './pages/inicio/inicio';
import { Trilhas } from './pages/trilhas/trilhas';
import { Conquistas } from './pages/conquistas/conquistas';
import { Simulados } from './pages/simulados/simulados';

export const routes: Routes = [
    {
        path: "login",
        component: Login
    },
    {
        path: "inicio",
        component: Inicio
    },
    {
        path: "trilhas",
        component: Trilhas
    },
    {
        path: "conquistas",
        component: Conquistas
    },
    {
        path: "simulados/:licaoId",
        component: Simulados
    },
    {
        path: "",
        redirectTo: "inicio",
        pathMatch: "full"
    }
];
