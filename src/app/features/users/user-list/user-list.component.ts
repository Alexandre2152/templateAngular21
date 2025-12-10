import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {UserService} from '../../../core/services/user.service';
import {User} from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container-fluid p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Gerenciamento de Usuários</mat-card-title>
          <div class="spacer"></div>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon> Novo Usuário
          </button>
        </mat-card-header>

        <mat-card-content class="mt-3">
          <table mat-table [dataSource]="users()" class="w-100">
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef> Usuário </th>
              <td mat-cell *matCellDef="let user"> {{user.username}} </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef> Email </th>
              <td mat-cell *matCellDef="let user"> {{user.email}} </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Ações </th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button color="primary"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .w-100 { width: 100%; }
    .mt-3 { margin-top: 1rem; }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  displayedColumns: string[] = ['username', 'email', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        // Ajuste conforme o retorno do seu backend (paginado ou lista direta)
        // Se for paginado: this.users.set(response.content);
        // Se for lista:
        if (Array.isArray(response)) {
          this.users.set(response);
        } else if ((response as any).content) {
          this.users.set((response as any).content);
        }
      },
      error: (err) => console.error('Erro ao carregar usuários', err)
    });
  }
}
