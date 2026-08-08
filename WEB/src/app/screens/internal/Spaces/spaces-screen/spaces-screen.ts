import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {InternalHeader} from '../../components/internal-header/internal-header';
import {InternalSideBar} from '../../components/internal-side-bar/internal-side-bar';
import {SpaceListItem} from '../../components/space-list-item/space-list-item';
import {SpaceListModel} from '../../models/space-list-model';
import {SpaceService} from '../../../../services/SpaceService/SpaceService';

@Component({
  selector: 'app-spaces-screen',
  standalone: true,
  imports: [
    InternalHeader,
    InternalSideBar,
    FormsModule,
    SpaceListItem
  ],
  templateUrl: './spaces-screen.html',
  styleUrl: './spaces-screen.scss'
})
export class SpacesScreen implements OnInit {

  constructor(

    private spaceService: SpaceService

  ) {}

  ngOnInit(): void {

    this.loadSpaces();

  }

  private loadSpaces(): void {

    this.spaceService.getAllSpaces()

      .subscribe({

        next: spaces => {

          console.log('SPACES', spaces);

          this.spaces = spaces;

        },

        error: err => {

          console.error(err);

        }

      });

  }

  search = '';

  spaces: SpaceListModel[] = [];

  newSpace(): void {

    console.log('Nuevo espacio');

  }

}
