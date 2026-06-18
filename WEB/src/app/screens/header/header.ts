import { Component } from '@angular/core';
import {map, Observable} from 'rxjs';
import {AuthService} from '../../services/AuthService/auth-service';
import {AsyncPipe} from '@angular/common';


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

  constructor(private authService: AuthService) {
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
}
