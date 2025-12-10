import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '../services/notification.service';
import {AuthService} from '../services/auth.service';
import {catchError, throwError} from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Token expirado ou inválido
        authService.logout();
        router.navigate(['/auth/login']);
        notificationService.showError('Sessão expirada. Faça login novamente.');
      } else if (error.status === 403) {
        // Sem permissão
        notificationService.showError('Você não tem permissão para realizar esta ação.');
      } else if (error.status === 404) {
        // Recurso não encontrado
        notificationService.showError('Recurso não encontrado.');
      } else if (error.status === 500) {
        // Erro no servidor
        notificationService.showError('Erro no servidor. Tente novamente mais tarde.');
      } else {
        // Outros erros
        const message = error.error?.message || 'Ocorreu um erro inesperado.';
        notificationService.showError(message);
      }

      return throwError(() => error);
    })
  );
};
