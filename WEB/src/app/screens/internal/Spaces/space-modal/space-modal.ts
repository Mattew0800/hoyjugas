import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SpaceService } from '../../../../services/SpaceService/SpaceService';

@Component({
  selector: 'app-space-modal',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './space-modal.html',
  styleUrl: './space-modal.scss'
})
export class SpaceModal {

  @Output()
  close = new EventEmitter<boolean>();

  space = {

    name: '',

    type: 'CANCHA',

    slotDuration: 60,

    isActive: true,

    depositFactor: 1,

    fixedDeposit: 10000,

    photoUrl: ''

  };

  constructor(
    private spaceService: SpaceService
  ) {}

  closeModal(): void {

    this.close.emit(false);

  }

  save(): void {

    console.log('ENVIANDO ESPACIO:', this.space);

    this.spaceService.createSpace(this.space).subscribe({

      next: response => {

        console.log('ESPACIO CREADO:', response);

        this.close.emit(true);

      },

      error: err => {

        console.error('ERROR AL CREAR ESPACIO:', err);

      }

    });

  }

}
