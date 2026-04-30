import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink],
  templateUrl: './log-in.html',
  styleUrl: './log-in.scss',
})
export class LogIn {
  window = window;
}
