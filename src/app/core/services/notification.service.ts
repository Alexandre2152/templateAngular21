import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import Swal, {SweetAlertIcon} from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  // Notificação simples com snackbar
  showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }

  // Notificação de sucesso
  showSuccess(message: string): void {
    this.showMessage(message, 'success');
  }

  // Notificação de erro
  showError(message: string): void {
    this.showMessage(message, 'error');
  }

  // Confirmação com SweetAlert2
  async showConfirmation(
    title: string,
    text: string,
    confirmButtonText: string = 'Confirmar',
    cancelButtonText: string = 'Cancelar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3f51b5',
      cancelButtonColor: '#f44336',
      confirmButtonText,
      cancelButtonText
    });

    return result.isConfirmed;
  }

  // Alert customizado
  showAlert(
    title: string,
    text: string,
    icon: SweetAlertIcon = 'info'
  ): Promise<any> {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#3f51b5'
    });
  }

  // Loading
  showLoading(title: string = 'Carregando...'): void {
    Swal.fire({
      title,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Fechar loading
  closeLoading(): void {
    Swal.close();
  }

  // Toast notification
  showToast(
    icon: SweetAlertIcon,
    title: string,
    timer: number = 3000
  ): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon,
      title
    });
  }
}
