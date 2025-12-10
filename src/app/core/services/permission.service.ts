import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Permission} from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/permissions`;
  private userPermissions = signal<Map<string, Set<string>>>(new Map());

  constructor(private http: HttpClient) {}

  loadUserPermissions(userId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        tap(permissions => {
          const permMap = new Map<string, Set<string>>();
          permissions.forEach(perm => {
            const actions = new Set<string>();
            perm.actions.forEach(action => {
              if (action.allowed) {
                actions.add(action.action);
              }
            });
            permMap.set(`${perm.module}`, actions);
          });
          this.userPermissions.set(permMap);
        })
      );
  }

  hasPermission(module: string, action: string): boolean {
    const modulePerms = this.userPermissions().get(module);
    return modulePerms ? modulePerms.has(action) : false;
  }

  canCreate(module: string): boolean {
    return this.hasPermission(module, 'CREATE');
  }

  canRead(module: string): boolean {
    return this.hasPermission(module, 'READ');
  }

  canUpdate(module: string): boolean {
    return this.hasPermission(module, 'UPDATE');
  }

  canDelete(module: string): boolean {
    return this.hasPermission(module, 'DELETE');
  }
}
