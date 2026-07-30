import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Router } from '@angular/router';
import {CommonModule, DOCUMENT} from '@angular/common';
import {BookingService} from '../../services/BookingService/booking-service';
import {clearAppScopedEarlyEventContract} from '@angular/core/primitives/event-dispatch';
import {SpaceCardDTO} from '../../models/SpaceCardDTO';

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

  constructor(
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    public bService: BookingService
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

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (value) {
      this.selectedDate = new Date(value);
    }
  }

  goToFieldSchedule(): void {
    this.router.navigate(['/field-schedule']);
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
        console.log(r);
      },
      error: (e)=>{
        console.log(e);
      }
    })
  }

  onImageError(space: SpaceCardDTO): void {
  space.imageUrl = ""; // Al volverlo null, Angular activará automáticamente el @else de tu HTML
}



}

