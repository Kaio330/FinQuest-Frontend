import { Component } from '@angular/core';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-inicio',
  imports: [DashboardLayout, Header],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {}
