import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from '../../shared/components/sidebar/sidebar.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer mode="side" opened class="sidenav">
        <app-sidebar></app-sidebar>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Gestão de Contratos</span>
          <span class="spacer"></span>
          <button mat-icon-button (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <main class="content p-4">
          <router-outlet></router-outlet> </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 250px; }
    .spacer { flex: 1 1 auto; }
    .content { padding: 20px; }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
