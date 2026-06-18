import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../../models/User';
import {RegisterRequestDTO} from '../../models/RegisterRequestDTO';
import {LoginRequestDTO} from '../../models/LoginRequestDTO';
import {BehaviorSubject, catchError, Observable, of, tap} from 'rxjs';
import {LoginResponseDTO} from '../../models/LoginResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  API_URL = "http://localhost:8080/hoyjugas/auth";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(public http: HttpClient) {
  }

  checkBackendSession(): Observable<User | null> {
    return this.http.get<User>(`${this.API_URL}/me`, { withCredentials: true }).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  logUser(user: LoginRequestDTO) {
    return this.http.post<LoginResponseDTO>(`${this.API_URL}/login`, user, { withCredentials: true }).pipe(
      tap(loggedUser => {
        this.setCurrentUser(loggedUser);
      })
    );
  }



  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  private clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  registerUser(user: RegisterRequestDTO){
    return this.http.post<RegisterRequestDTO>(`${this.API_URL}/register`,user);
  }

}
