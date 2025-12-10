import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {Role} from '../models/role.model';
import {HttpClient} from '@angular/common/http';
import {Permission} from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Listar todos os roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl).pipe(
      tap(roles => this.rolesSubject.next(roles))
    );
  }

  // Buscar role por ID
  getRole(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  // Criar novo role
  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role).pipe(
      tap(() => this.getRoles().subscribe())
    );
  }

  // Atualizar role
  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role).pipe(
      tap(() => this.getRoles().subscribe())
    );
  }

  // Deletar role
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getRoles().subscribe())
    );
  }

  // Buscar permissões de um role
  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/${roleId}/permissions`);
  }

  // Atualizar permissões de um role
  updateRolePermissions(roleId: number, permissions: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${roleId}/permissions`, permissions);
  }

  // Atribuir role a um usuário
  assignRoleToUser(userId: number, roleId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, {
      userId,
      roleId
    });
  }

  // Remover role de um usuário
  removeRoleFromUser(userId: number, roleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${userId}/${roleId}`);
  }

  // Buscar todos os módulos disponíveis
  getAvailableModules(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/modules`);
  }
}
