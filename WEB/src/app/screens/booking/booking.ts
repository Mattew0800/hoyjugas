import {Component, inject, Inject, OnInit, Renderer2} from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Router } from '@angular/router';
import {CommonModule, DOCUMENT} from '@angular/common';
import {BookingService} from '../../services/BookingService/booking-service';
import {clearAppScopedEarlyEventContract} from '@angular/core/primitives/event-dispatch';
import {SpaceCardDTO} from '../../models/SpaceCardDTO';
import {BookingStateService} from '../../services/BookingStateService/booking-state-service';

@Component({
  selector: 'app-booking',
  imports: [
    Header,
    BottomNavbar,
    CommonModule
  ],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking implements OnInit{

  availableFieldTypes: string[] = [];
  selectedFieldType: string = '';

  selectedDate: Date = new Date();

  closingTime: string = "";

  emptySpacesCard: boolean = false;

  spacesCardList: SpaceCardDTO[];

  private bService=  inject(BookingService);
  private bStateService = inject(BookingStateService);


  constructor(
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,

  ) {
    this.spacesCardList = [];
  }

  ngOnInit() {
    //this.meta.updateTag({ name: 'theme-color', content: '#CEA764' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
    this.getSpacesCard();

  }

  get activeIndex(): number {
    return this.availableFieldTypes.indexOf(this.selectedFieldType);
  }

  get filteredSpacesCardList(): SpaceCardDTO[] {
    return this.spacesCardList.filter(space => space.type === this.selectedFieldType);
  }

  selectFieldType(type: string): void {
    this.selectedFieldType = type;
  }

  formatFieldType(type: string): string {
    if (!type) return '';
    const map: { [key: string]: string } = {
      'FOOTBALL_5': 'Fútbol 5',
      'FOOTBALL_6': 'Fútbol 6',
      'FOOTBALL_7': 'Fútbol 7',
      'FOOTBALL_8': 'Fútbol 8',
      'FOOTBALL_9': 'Fútbol 9',
      'FOOTBALL_11': 'Fútbol 11',
      'F5': 'Fútbol 5',
      'F7': 'Fútbol 7',
      'F11': 'Fútbol 11',
      'PADEL': 'Pádel',
      'TENNIS': 'Tenis'
    };
    return map[type.toUpperCase()] || type.replace(/_/g, ' ');
  }

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (value) {
      this.selectedDate = new Date(value);
    }
  }

  goToFieldSchedule(spaceId: number): void {
    this.bStateService.patch({spaceId});
    this.router.navigate(['/field-schedule/date-selection']);
  }

  getSpacesCard(){
    return this.bService.getSpacesCard().subscribe({
      next: (r)=>{
        this.spacesCardList = r.filter(space => space.isActive);
        if(this.spacesCardList.length === 0){
          this.emptySpacesCard = true;
        } else {
          this.availableFieldTypes = Array.from(new Set(this.spacesCardList.map(s => s.type)));
          this.selectedFieldType = this.availableFieldTypes[0];
        }

      },
      error: (e)=>{
        this.emptySpacesCard = true;
        console.log(e);
      }
    })
  }

  onImageError(space: SpaceCardDTO): void {
  space.imageUrl = ""; // Al volverlo null, Angular activará automáticamente el @else de tu HTML
}



}

