import { Component, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface DateOption {
  value: Date;
  day: number;
  month: string;
  availableSlots: number;
}

@Component({
  selector: 'app-field-schedule',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    Header,
    BottomNavbar
  ],
  templateUrl: './field-schedule.html',
  styleUrl: './field-schedule.scss'
})
export class FieldSchedule {

  realHeight = window.innerHeight;

  constructor(
    private router: Router
  ) {}


}
