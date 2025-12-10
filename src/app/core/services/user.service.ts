import {computed, Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {User} from '../models/user.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Role} from '../models/role.model';
import {Permission} from '../models/permission.model';

export interface UserFilter {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  // Using Signals for reactive state
  private usersSignal = signal<User[]>([]);
  public users = this.usersSignal.asReadonly();
  public totalUsers = computed(() => this.usersSignal().length);
  public activeUsers = computed(() =>
    this.usersSignal().filter(u => u.active).length
  );

  constructor(private http: HttpClient) {}

  // Listar usuários com paginação e filtros
  getUsers(filter?: UserFilter): Observable<PagedResponse<User>> {
    let params = new HttpParams();

    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PagedResponse<User>>(this.apiUrl, { params }).pipe(
      tap(response => {
        this.usersSubject.next(response.content);
        this.usersSignal.set(response.content);
      })
    );
  }

  // Buscar usuário por ID
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Criar novo usuário
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(() => this.refreshUsers())
    );
  }

  // Atualizar usuário
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      tap(() => this.refreshUsers())
    );
  }

  // Deletar usuário
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshUsers())
    );
  }

  // Ativar usuário
  activateUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {}).pipe(
      tap(() => this.refreshUsers())
    );
  }

  // Desativar usuário
  deactivateUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      tap(() => this.refreshUsers())
    );
  }

  // Buscar roles de um usuário
  getUserRoles(userId: number): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/${userId}/roles`);
  }

  // Atualizar roles de um usuário
  updateUserRoles(userId: number, roleIds: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/roles`, { roleIds });
  }

  // Resetar senha
  resetUserPassword(id: number, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reset-password`, {
      password: newPassword
    });
  }

  // Upload de foto do usuário
  uploadUserPhoto(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/${id}/photo`, formData);
  }

  // Buscar permissões do usuário
  getUserPermissions(userId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/${userId}/permissions`);
  }

  // Refresh da lista de usuários
  private refreshUsers(): void {
    this.getUsers().subscribe();
  }

  // Exportar usuários para CSV
  exportUsers(filter?: UserFilter): Observable<Blob> {
    let params = new HttpParams();

    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Importar usuários de CSV
  importUsers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/import`, formData);
  }

  // Buscar estatísticas dos usuários
  getUserStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }
}
