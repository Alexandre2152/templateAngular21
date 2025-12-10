import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {UserService} from '../../../core/services/user.service';
import {User} from '../../../core/models/user.model';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatChipsModule} from '@angular/material/chips';
import {MatMenuModule} from '@angular/material/menu';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {NotificationService} from '../../../core/services/notification.service';
import {AuthService} from '../../../core/services/auth.service';
import {UserFormComponent} from '../user-form/user-form.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  template: `
    <div class="container-fluid p-4">
      <mat-card>
        <mat-card-header class="header-actions">
          <mat-card-title>Gerenciamento de Usuários</mat-card-title>
          <span class="spacer"></span>
          <button mat-raised-button color="primary" (click)="openUserDialog()">
            <mat-icon>add</mat-icon> Novo Usuário
          </button>
        </mat-card-header>

        <mat-card-content class="mt-3">
          <div class="table-container">
            <table mat-table [dataSource]="users()" class="w-100">

              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef> Usuário </th>
                <td mat-cell *matCellDef="let user">
                  <div class="d-flex align-items-center gap-2">
                    <mat-icon class="text-muted">account_circle</mat-icon>
                    <div>
                      <div class="fw-bold">{{user.username}}</div>
                      <small class="text-muted">{{user.firstName}} {{user.lastName}}</small>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef> Email </th>
                <td mat-cell *matCellDef="let user"> {{user.email}} </td>
              </ng-container>

              <ng-container matColumnDef="roles">
                <th mat-header-cell *matHeaderCellDef> Perfil </th>
                <td mat-cell *matCellDef="let user">
                  <div class="d-flex gap-1 flex-wrap">
                    @for (role of user.roles; track role) {
                      <span class="role-badge" [class]="getRoleClass(role)">
                        {{ formatRole(role) }}
                      </span>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let user">
                  <mat-slide-toggle
                    [checked]="user.active"
                    (change)="toggleStatus(user)"
                    color="primary"
                    matTooltip="Ativar/Desativar Usuário">
                    {{ user.active ? 'Ativo' : 'Inativo' }}
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Ações </th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Ações">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openUserDialog(user)">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button mat-menu-item (click)="deleteUser(user)">
                      <mat-icon color="warn">delete</mat-icon>
                      <span class="text-warn">Excluir</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
    .spacer { flex: 1 1 auto; }
    .w-100 { width: 100%; }
    .mt-3 { margin-top: 1rem; }
    .gap-2 { gap: 0.5rem; }
    .d-flex { display: flex; }
    .align-items-center { align-items: center; }
    .text-muted { color: #666; }
    .fw-bold { font-weight: 500; }
    .text-warn { color: #f44336; }

    .role-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .role-admin { background-color: #e3f2fd; color: #1565c0; border: 1px solid #bbdefb; }
    .role-user { background-color: #f5f5f5; color: #616161; border: 1px solid #e0e0e0; }
    .role-mod { background-color: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  users = signal<User[]>([]);
  displayedColumns: string[] = ['username', 'email', 'roles', 'status', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        // Trata a resposta se for paginada ou lista direta
        const data = Array.isArray(response) ? response : (response as any).content || [];
        this.users.set(data);
      },
      error: (err) => this.notification.showError('Erro ao carregar usuários')
    });
  }

  // Abre o modal para Criar ou Editar
  openUserDialog(user?: User) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      disableClose: true,
      data: user || null // Se passar usuário é edição, senão é criação
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.updateUser(result);
        } else {
          this.createUser(result);
        }
      }
    });
  }

  createUser(user: any) {
    this.userService.createUser(user).subscribe({
      next: () => {
        this.notification.showSuccess('Usuário criado com sucesso!');
        this.loadUsers();
      },
      error: (err) => this.notification.showError(err.error?.message || 'Erro ao criar usuário')
    });
  }

  updateUser(user: any) {
    this.userService.updateUser(user.id, user).subscribe({
      next: () => {
        this.notification.showSuccess('Usuário atualizado com sucesso!');
        this.loadUsers();
      },
      error: (err) => this.notification.showError('Erro ao atualizar usuário')
    });
  }

  // Lógica do Slide Toggle para ativar/desativar
  toggleStatus(user: User) {
    if (!user.id) return;

    // Optimistic update (atualiza a UI antes de confirmar com o back para parecer mais rápido)
    const originalStatus = user.active;

    const action = user.active
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);

    action.subscribe({
      next: () => {
        const msg = !originalStatus ? 'ativado' : 'desativado';
        this.notification.showSuccess(`Usuário ${msg}!`);
        // Atualiza o estado local
        user.active = !originalStatus;
      },
      error: () => {
        this.notification.showError('Erro ao alterar status');
        // Reverte o toggle na UI se der erro
        user.active = originalStatus;
        this.loadUsers(); // Recarrega para garantir consistência
      }
    });
  }

  async deleteUser(user: User) {
    const confirmed = await this.notification.showConfirmation(
      'Confirmar Exclusão',
      `Deseja realmente excluir o usuário <b>${user.username}</b>? Esta ação não pode ser desfeita.`
    );

    if (confirmed && user.id) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.notification.showSuccess('Usuário excluído com sucesso!');
          this.loadUsers();
        },
        error: () => this.notification.showError('Erro ao excluir usuário')
      });
    }
  }

  // Auxiliares visuais
  formatRole(role: string): string {
    return role.replace('ROLE_', '');
  }

  getRoleClass(role: string): string {
    const r = role.replace('ROLE_', '').toLowerCase();
    if (r === 'admin') return 'role-admin';
    if (r === 'moderator' || r === 'mod') return 'role-mod';
    return 'role-user';
  }
}
