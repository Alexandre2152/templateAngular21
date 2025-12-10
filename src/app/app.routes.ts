import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Rotas Protegidas (Dashboard, Users, Roles)
  {
    path: '',
    component: AdminLayoutComponent, // Este componente terá o Sidebar e o <router-outlet> interno
    canActivate: [AuthGuard], // Protege todas as rotas filhas [cite: 232]
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'admin',
        children: [ // Agrupamento de rotas administrativas
          {
            path: 'users',
            loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
          },
          {
            path: 'roles',
            loadComponent: () => import('./features/roles/role-list/role-list.component').then(m => m.RoleListComponent)
          },
          {
            path: 'permissions',
            loadComponent: () => import('./features/roles/permission-matrix/permission-matrix.component').then(m => m.PermissionMatrixComponent)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Redirecionamento padrão para rota raiz
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
