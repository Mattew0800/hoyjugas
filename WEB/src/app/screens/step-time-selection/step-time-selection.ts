import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-step-time-selection',
  imports: [RouterLink, Header, BottomNavbar],
  templateUrl: './step-time-selection.html',
  styleUrl: './step-time-selection.scss',
})
export class StepTimeSelection {

}
