import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="dashboard-container">
      <h1>Bem-vindo, {{ user()?.username }}!</h1>
      <div class="stats-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Status do Sistema</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Sistema operando normalmente.</p>
            <p>Permissões carregadas: {{ user()?.roles?.join(', ') }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  user = this.authService.user; // Signal do usuário atual [cite: 24]
}
