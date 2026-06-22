import { Component } from '@angular/core';
import {map, Observable} from 'rxjs';
import {AuthService} from '../../services/AuthService/auth-service';
import {AsyncPipe} from '@angular/common';
import {Router} from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',

  imports: [
    AsyncPipe
  ]
})
export class Header {

  userName$?:Observable<String>;

  constructor(private authService: AuthService, private router: Router) {
    this.userName$ = this.authService.currentUser$
      .pipe(
        map(user => {
          const fullName = user?.name ?? '';
          const parts = fullName.trim().split(' ');
          const firstName = parts.length > 0 ? parts[0] : '';
          return firstName ? firstName.toUpperCase() : 'INVITADO';
        })
      );

  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
