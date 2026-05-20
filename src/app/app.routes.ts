import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Inicio } from './pages/inicio/inicio';

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
        path: "",
        redirectTo: "inicio",
        pathMatch: "full"
    }
];
