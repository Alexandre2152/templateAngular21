import {Component, computed, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {AuthService} from '../../../core/services/auth.service';
import {PermissionService} from '../../../core/services/permission.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  module?: string;
  requiredPermission?: string;
  children?: MenuItem[];
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule
  ],
  template: `
    <mat-nav-list>
      <div class="profile-section">
        <div class="avatar">
          <mat-icon>person</mat-icon>
        </div>
        <div class="user-info">
          <h3>{{ currentUser()?.username }}</h3>
          <small>{{ getUserRoles() }}</small>
        </div>
      </div>

      <mat-divider></mat-divider>

      @for (item of visibleMenuItems(); track item.label) {
        @if (!item.children) {
          <mat-list-item [routerLink]="item.route" routerLinkActive="active">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </mat-list-item>
        } @else {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>{{ item.icon }}</mat-icon>
                <span class="menu-title">{{ item.label }}</span>
              </mat-panel-title>
            </mat-expansion-panel-header>

            @for (child of item.children; track child.label) {
              @if (canViewMenuItem(child)) {
                <mat-list-item [routerLink]="child.route" routerLinkActive="active">
                  <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                  <span matListItemTitle>{{ child.label }}</span>
                </mat-list-item>
              }
            }
          </mat-expansion-panel>
        }
      }
    </mat-nav-list>
  `,
  styles: [`
    .profile-section {
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      .avatar {
        width: 80px;
        height: 80px;
        margin: 0 auto 10px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
        }
      }

      h3 {
        margin: 0;
        font-weight: 500;
      }
    }

    mat-list-item {
      &.active {
        background: rgba(103, 126, 234, 0.1);
        border-left: 3px solid #667eea;
      }
    }

    .menu-title {
      margin-left: 10px;
    }
  `]
})
export class SidebarComponent {
  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Administração',
      icon: 'admin_panel_settings',
      roles: ['ROLE_ADMIN'],
      children: [
        {
          label: 'Usuários',
          icon: 'people',
          route: '/admin/users',
          // module: 'USERS',
          // requiredPermission: 'READ'
          roles: ['ROLE_ADMIN']
        },
        {
          label: 'Perfis',
          icon: 'badge',
          route: '/admin/roles',
          module: 'ROLES',
          requiredPermission: 'READ'
        },
        {
          label: 'Permissões',
          icon: 'security',
          route: '/admin/permissions',
          module: 'PERMISSIONS',
          requiredPermission: 'READ'
        }
      ]
    },
    {
      label: 'Contratos',
      icon: 'description',
      roles: ['ROLE_ADMIN', 'ROLE_USER'],
      children: [
        {
          label: 'Listar',
          icon: 'list',
          route: '/contracts',
          module: 'CONTRACTS',
          requiredPermission: 'READ'
        },
        {
          label: 'Novo',
          icon: 'add',
          route: '/contracts/new',
          module: 'CONTRACTS',
          requiredPermission: 'CREATE'
        }
      ]
    }
  ]);

  currentUser = computed(() => this.authService.user());

  visibleMenuItems = computed(() => {
    return this.menuItems().filter(item => this.canViewMenuItem(item));
  });

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  canViewMenuItem(item: MenuItem): boolean {
    // Check role-based access
    if (item.roles && !this.authService.hasAnyRole(item.roles)) {
      return false;
    }

    // Check permission-based access
    if (item.module && item.requiredPermission) {
      return this.permissionService.hasPermission(item.module, item.requiredPermission);
    }

    return true;
  }

  getUserRoles(): string {
    return this.authService.userRoles().join(', ');
  }
}
