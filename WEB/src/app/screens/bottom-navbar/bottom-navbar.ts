import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.html',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  styleUrls: ['./bottom-navbar.scss']
})
export class BottomNavbar {

  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToContact(): void {
    this.router.navigate(['/contact']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
