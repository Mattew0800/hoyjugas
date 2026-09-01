import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';
import { SpaceListItem } from '../../components/space-list-item/space-list-item';
import {SpaceModal} from '../space-modal/space-modal';
import { SpaceListModel } from '../../models/space-list-model';

import { SpaceService } from '../../../../services/SpaceService/SpaceService';

@Component({
  selector: 'app-spaces-screen',
  standalone: true,
  imports: [
    InternalHeader,
    InternalSideBar,
    FormsModule,
    SpaceListItem,
    SpaceModal
  ],
  templateUrl: './spaces-screen.html',
  styleUrl: './spaces-screen.scss'
})
export class SpacesScreen implements OnInit {

  search = '';

  showModal = false;

  spaces: SpaceListModel[] = [];

  constructor(
    private spaceService: SpaceService
  ) {}

  ngOnInit(): void {

    this.loadSpaces();

  }

  selectedSpaceId: number | null = null;


  private loadSpaces(): void {

    this.spaceService.getAllSpaces().subscribe({

      next: spaces => {

        this.spaces = spaces;

      },

      error: err => {

        console.error(err);

      }

    });

  }

  newSpace(): void {

    this.selectedSpaceId = null;

    this.showModal = true;

  }

  closeModal(created: boolean): void {

    this.showModal = false;

    if (created) {

      this.loadSpaces();

    }

  }

  editSpace(spaceId: number): void {

    this.selectedSpaceId = spaceId;

    this.showModal = true;

  }

}
