import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit
} from '@angular/core';

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
export class SpaceModal implements OnInit {

  @Input()
  spaceId: number | null = null;

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

  ngOnInit(): void {

    if (this.spaceId !== null) {

      this.loadSpace();

    }

  }

  private loadSpace(): void {

    this.spaceService.getSpaceDetail(this.spaceId!).subscribe({

      next: space => {

        console.log('ESPACIO CARGADO:', space);

        this.space = {

          name: space.name,

          type: space.type,

          slotDuration: space.slotDuration,

          isActive: space.isActive,

          depositFactor: space.depositFactor,

          fixedDeposit: space.fixedDeposit,

          photoUrl: space.photoUrl ?? ''

        };

      },

      error: err => {

        console.error(
          'ERROR AL CARGAR ESPACIO:',
          err
        );

      }

    });

  }

  closeModal(): void {

    this.close.emit(false);

  }

  save(): void {

    if (this.spaceId === null) {

      this.createSpace();

    } else {

      this.updateSpace();

    }

  }

  private createSpace(): void {

    this.spaceService.createSpace(this.space).subscribe({

      next: response => {

        console.log(
          'ESPACIO CREADO:',
          response
        );

        this.close.emit(true);

      },

      error: err => {

        console.error(
          'ERROR AL CREAR ESPACIO:',
          err
        );

      }

    });

  }

  private updateSpace(): void {

    const request = {

      spaceId: this.spaceId,

      ...this.space

    };

    console.log(
      'ACTUALIZANDO ESPACIO:',
      request
    );

    this.spaceService.updateSpace(request).subscribe({

      next: response => {

        console.log(
          'ESPACIO ACTUALIZADO:',
          response
        );

        this.close.emit(true);

      },

      error: err => {

        console.error(
          'ERROR AL ACTUALIZAR ESPACIO:',
          err
        );

      }

    });

  }

}
