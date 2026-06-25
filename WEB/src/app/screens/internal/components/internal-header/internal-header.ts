import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-internal-header',
  imports: [],
  templateUrl: './internal-header.html',
  styleUrl: './internal-header.scss'
})
export class InternalHeader {

  @Input() title = '';

  @Input() subtitle = '';

  userName = 'Ignacio';

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

}
