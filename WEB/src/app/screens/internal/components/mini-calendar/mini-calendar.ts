import { Component } from '@angular/core';

@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [],
  templateUrl: './mini-calendar.html',
  styleUrl: './mini-calendar.scss'
})
export class MiniCalendar {

  month = 'Mayo 2025';

  weekDays = [
    'LUN',
    'MAR',
    'MIÉ',
    'JUE',
    'VIE',
    'SÁB',
    'DOM'
  ];

  days = [

    null,
    null,
    null,
    null,

    1,
    2,
    3,
    4,

    5,
    6,
    7,
    8,
    9,
    10,
    11,

    12,
    13,
    14,
    15,
    16,
    17,
    18,

    19,
    20,
    21,
    22,
    23,
    24,
    25,

    26,
    27,
    28,
    29,
    30,
    31

  ];

  selectedDay = 25;

}
