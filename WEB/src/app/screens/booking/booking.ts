import { Component } from '@angular/core';
import {Header} from '../header/header';
import {BottomNavbar} from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-booking',
  imports: [Header, BottomNavbar],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {

}
