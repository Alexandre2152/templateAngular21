import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../../core/services/auth.service';
import {Router} from '@angular/router';
import {NotificationService} from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuário</mat-label>
              <input matInput formControlName="username" placeholder="Digite seu usuário">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Digite sua senha">
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || isLoading()">
              {{ isLoading() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
    .login-card { width: 100%; max-width: 400px; padding: 20px; }
    .full-width { width: 100%; margin-bottom: 15px; }
    button { width: 100%; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isLoading = signal(false);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { username, password } = this.loginForm.value;

      this.authService.login({ username: username!, password: password! }).subscribe({
        next: () => {
          this.notification.showSuccess('Login realizado com sucesso!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.notification.showError('Usuário ou senha inválidos');
          this.isLoading.set(false);
        }
      });
    }
  }
}
