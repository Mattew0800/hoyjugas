// home.component.ts

import { Component } from '@angular/core';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-home',
  imports: [BottomNavbar],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  userName: string = 'MARTÍN';

  availableTurns: number = 3;

  closingHour: string = '23:00';

}
