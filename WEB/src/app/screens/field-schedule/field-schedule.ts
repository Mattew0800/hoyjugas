import { Component, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {SelectDateModal} from '../../components/select-date-modal/select-date-modal';

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
    RouterLink,
    Header,
    BottomNavbar,
    SelectDateModal
  ],
  templateUrl: './field-schedule.html',
  styleUrl: './field-schedule.scss'
})
export class FieldSchedule {

  realHeight = window.innerHeight;

  constructor(
    private router: Router
  ) {}

  isModalOpen = false;
  isClosing = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.isModalOpen = false;
      this.isClosing = false;
    }, 600);
  }

  handleDateConfirmed(date: string) {

    this.isModalOpen = false;
  }


}
