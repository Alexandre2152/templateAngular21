import {Component, Inject, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {User} from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode() ? 'Editar Usuário' : 'Novo Usuário' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <div class="row">
          <mat-form-field appearance="outline" class="col">
            <mat-label>Usuário (Login)</mat-label>
            <input matInput formControlName="username" placeholder="Ex: admin">
            <mat-error *ngIf="userForm.get('username')?.hasError('required')">Obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="col">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="Ex: admin@email.com">
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">Email inválido</mat-error>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="col">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="firstName">
          </mat-form-field>

          <mat-form-field appearance="outline" class="col">
            <mat-label>Sobrenome</mat-label>
            <input matInput formControlName="lastName">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Perfil de Acesso</mat-label>
          <mat-select formControlName="roles" multiple>
            <mat-option value="admin">Administrador</mat-option>
            <mat-option value="user">Usuário Comum</mat-option>
            <mat-option value="mod">Moderador</mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('roles')?.hasError('required')">Selecione pelo menos um perfil</mat-error>
        </mat-form-field>

        @if (!isEditMode()) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Senha</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">Obrigatório na criação</mat-error>
            <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="userForm.invalid"
              (click)="save()">
        {{ isEditMode() ? 'Salvar' : 'Criar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form { display: flex; flex-direction: column; gap: 8px; padding-top: 10px; }
    .row { display: flex; gap: 10px; }
    .col { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class UserFormComponent {
  private fb = inject(FormBuilder);

  userForm: FormGroup;
  hidePassword = true;
  isEditMode = signal(false);

  constructor(
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | null
  ) {
    this.isEditMode.set(!!data);

    this.userForm = this.fb.group({
      username: [data?.username || '', [Validators.required, Validators.minLength(3)]],
      email: [data?.email || '', [Validators.required, Validators.email]],
      firstName: [data?.firstName || ''],
      lastName: [data?.lastName || ''],
      // Mapeia as roles vindas do back (ROLE_ADMIN -> admin) para o select
      roles: [this.mapRolesFromBackend(data?.roles) || ['user'], Validators.required],
      // Senha obrigatória apenas na criação
      password: ['', data ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  private mapRolesFromBackend(roles?: any[]): string[] {
    if (!roles) return [];
    // Remove o prefixo ROLE_ e converte para minúsculo para bater com o <mat-option value="...">
    return roles.map(r => r.replace('ROLE_', '').toLowerCase());
  }

  save() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      // Se for edição, precisamos mandar o ID de volta
      const result = { ...formValue, id: this.data?.id };
      this.dialogRef.close(result);
    }
  }
}
