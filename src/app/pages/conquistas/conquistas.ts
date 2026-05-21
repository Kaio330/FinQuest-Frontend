import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConquistaService } from '../../services/conquista.service';
import { Conquista } from '../../models/conquista.model';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';

@Component({
  selector: 'app-conquistas',
  standalone: true,
  imports: [CommonModule, DashboardLayout],
  templateUrl: './conquistas.html',
  styleUrls: ['./conquistas.css']
})
export class Conquistas implements OnInit {
  private conquistaService = inject(ConquistaService);
  conquistas: Conquista[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    // Assuming a hardcoded player ID 1 for now until auth is implemented
    this.conquistaService.getConquistas(1).subscribe({
      next: (data) => {
        this.conquistas = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load conquistas. Backend might not be running.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
