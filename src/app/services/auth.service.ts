import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment.github';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  login(username: string, password: string): boolean {
    const isValid =
      username === environment.auth.username &&
      password === environment.auth.password;

    this.isAuthenticatedSubject.next(isValid);
    if (isValid) {
      localStorage.setItem('isAuthenticated', 'true');
    }
    return isValid;
  }

  logout() {
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('isAuthenticated');
  }

  checkAuthStatus() {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    this.isAuthenticatedSubject.next(isAuth);
    return isAuth;
  }
}
