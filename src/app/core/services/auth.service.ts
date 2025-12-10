import {computed, Injectable, signal} from '@angular/core';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {LoginResponse, SignupRequest} from '../models/user.model';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {LoginRequest} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Using Angular Signals (new feature)
  private userSignal = signal<LoginResponse | null>(null);
  public user = this.userSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.userSignal());
  public userRoles = computed(() => this.userSignal()?.roles || []);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
      this.userSignal.set(user);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/signin`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response);
          this.userSignal.set(response);
        })
      );
  }

  register(user: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
}
