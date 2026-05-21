import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrilhaService } from '../../services/trilha.service';
import { Nivel } from '../../models/nivel.model';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trilhas',
  standalone: true,
  imports: [CommonModule, DashboardLayout, RouterModule],
  templateUrl: './trilhas.html',
  styleUrls: ['./trilhas.css']
})
export class Trilhas implements OnInit {
  private trilhaService = inject(TrilhaService);
  niveis: Nivel[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.trilhaService.getTrilhas().subscribe({
      next: (data) => {
        this.niveis = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load trilhas. Backend might not be running.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
