import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {Role} from '../../../core/models/role.model';
import {RoleService} from '../../../core/services/role.service';

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Matriz de Permissões</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div class="role-selector">
          <mat-form-field>
            <mat-label>Selecione um Perfil</mat-label>
            <mat-select [(value)]="selectedRole" (selectionChange)="loadRolePermissions()">
              @for (role of roles(); track role.id) {
                <mat-option [value]="role">{{ role.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        @if (selectedRole) {
          <table mat-table [dataSource]="permissions()" class="permission-table">
            <!-- Module Column -->
            <ng-container matColumnDef="module">
              <th mat-header-cell *matHeaderCellDef>Módulo</th>
              <td mat-cell *matCellDef="let permission">
                <div class="module-info">
                  <mat-icon>{{ getModuleIcon(permission.module) }}</mat-icon>
                  <span>{{ permission.module }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Create Column -->
            <ng-container matColumnDef="create">
              <th mat-header-cell *matHeaderCellDef>
                <div class="action-header">
                  <mat-icon>add</mat-icon>
                  Criar
                </div>
              </th>
              <td mat-cell *matCellDef="let permission">
                <mat-checkbox
                  [(ngModel)]="permission.actions.create"
                  (change)="updatePermission(permission, 'CREATE', $event)"
                  [disabled]="!canEditPermissions">
                </mat-checkbox>
              </td>
            </ng-container>

            <!-- Read Column -->
            <ng-container matColumnDef="read">
              <th mat-header-cell *matHeaderCellDef>
                <div class="action-header">
                  <mat-icon>visibility</mat-icon>
                  Visualizar
                </div>
              </th>
              <td mat-cell *matCellDef="let permission">
                <mat-checkbox
                  [(ngModel)]="permission.actions.read"
                  (change)="updatePermission(permission, 'READ', $event)"
                  [disabled]="!canEditPermissions">
                </mat-checkbox>
              </td>
            </ng-container>

            <!-- Update Column -->
            <ng-container matColumnDef="update">
              <th mat-header-cell *matHeaderCellDef>
                <div class="action-header">
                  <mat-icon>edit</mat-icon>
                  Editar
                </div>
              </th>
              <td mat-cell *matCellDef="let permission">
                <mat-checkbox
                  [(ngModel)]="permission.actions.update"
                  (change)="updatePermission(permission, 'UPDATE', $event)"
                  [disabled]="!canEditPermissions">
                </mat-checkbox>
              </td>
            </ng-container>

            <!-- Delete Column -->
            <ng-container matColumnDef="delete">
              <th mat-header-cell *matHeaderCellDef>
                <div class="action-header">
                  <mat-icon>delete</mat-icon>
                  Excluir
                </div>
              </th>
              <td mat-cell *matCellDef="let permission">
                <mat-checkbox
                  [(ngModel)]="permission.actions.delete"
                  (change)="updatePermission(permission, 'DELETE', $event)"
                  [disabled]="!canEditPermissions">
                </mat-checkbox>
              </td>
            </ng-container>

            <!-- Select All Column -->
            <ng-container matColumnDef="selectAll">
              <th mat-header-cell *matHeaderCellDef>
                <div class="action-header">
                  <mat-icon>done_all</mat-icon>
                  Todos
                </div>
              </th>
              <td mat-cell *matCellDef="let permission">
                <mat-checkbox
                  [checked]="isAllSelected(permission)"
                  (change)="toggleAll(permission, $event)"
                  [disabled]="!canEditPermissions">
                </mat-checkbox>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div class="actions">
            <button mat-raised-button color="primary"
                    (click)="savePermissions()"
                    [disabled]="!canEditPermissions">
              <mat-icon>save</mat-icon>
              Salvar Permissões
            </button>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .permission-table {
      width: 100%;
      margin-top: 20px;
    }

    .module-info {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
    }

    .action-header {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 500;
    }

    .actions {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    mat-checkbox {
      margin: 0 auto;
      display: block;
    }
  `]
})
export class PermissionMatrixComponent implements OnInit {
  roles = signal<Role[]>([]);
  permissions = signal<any[]>([]);
  selectedRole: Role | null = null;
  canEditPermissions = true;

  displayedColumns = ['module', 'create', 'read', 'update', 'delete', 'selectAll'];

  modules = [
    { name: 'USERS', icon: 'people', label: 'Usuários' },
    { name: 'ROLES', icon: 'badge', label: 'Perfis' },
    { name: 'CONTRACTS', icon: 'description', label: 'Contratos' },
    { name: 'REPORTS', icon: 'assessment', label: 'Relatórios' },
    { name: 'SETTINGS', icon: 'settings', label: 'Configurações' }
  ];

  constructor(private roleService: RoleService) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe((roles: Role[]) => {
      this.roles.set(roles);
    });
  }

  loadRolePermissions() {
    if (!this.selectedRole) return;

    // Initialize permission matrix
    const permissionMatrix = this.modules.map(module => ({
      module: module.name,
      label: module.label,
      actions: {
        create: false,
        read: false,
        update: false,
        delete: false
      }
    }));

    // Load existing permissions for the role
    this.roleService.getRolePermissions(this.selectedRole.id!).subscribe((permissions: any[]) => {
      permissions.forEach(perm => {
        const modulePermission = permissionMatrix.find(m => m.module === perm.module);
        if (modulePermission) {
          perm.actions.forEach((action: { allowed: any; action: string; }) => {
            if (action.allowed) {
              const actionName = action.action.toLowerCase() as 'create' | 'read' | 'update' | 'delete';
              modulePermission.actions[actionName] = true;
            }
          });
        }
      });

      this.permissions.set(permissionMatrix);
    });
  }

  getModuleIcon(module: string): string {
    return this.modules.find(m => m.name === module)?.icon || 'folder';
  }

  updatePermission(permission: any, action: string, event: any) {
    // Logic to update individual permission
  }

  isAllSelected(permission: any): boolean {
    return permission.actions.create &&
      permission.actions.read &&
      permission.actions.update &&
      permission.actions.delete;
  }

  toggleAll(permission: any, event: any) {
    const checked = event.checked;
    permission.actions.create = checked;
    permission.actions.read = checked;
    permission.actions.update = checked;
    permission.actions.delete = checked;
  }

  savePermissions() {
    if (!this.selectedRole) return;

    const permissionsToSave = this.permissions().map(perm => ({
      module: perm.module,
      actions: Object.entries(perm.actions)
        .filter(([_, allowed]) => allowed)
        .map(([action, _]) => action.toUpperCase())
    }));

    this.roleService.updateRolePermissions(
      this.selectedRole.id!,
      permissionsToSave
    ).subscribe({
      next: () => {
        // Show success message
        console.log('Permissões salvas com sucesso!');
      },
      error: (error: any) => {
        console.error('Erro ao salvar permissões:', error);
      }
    });
  }
}
