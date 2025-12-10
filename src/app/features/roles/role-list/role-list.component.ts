import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Perfis de Acesso</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Lista de perfis será implementada aqui.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RoleListComponent {}
