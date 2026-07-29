import { AsyncPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import {AuthService} from '../../../../services/AuthService/auth-service';
import {User} from '../../../../models/User';

@Component({
  selector: 'app-internal-header',
  imports: [AsyncPipe],
  templateUrl: './internal-header.html',
  styleUrl: './internal-header.scss'
})
export class InternalHeader {

  @Input() title = '';
  @Input() subtitle = '';

  currentUser$!: Observable<User | null>;

  menuOpen = false;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

}
