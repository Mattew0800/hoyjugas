import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';
import { SpaceListItem } from '../../components/space-list-item/space-list-item';
import { SpaceModal } from '../space-modal/space-modal';
import { SpaceListModel } from '../../models/space-list-model';

import { SpaceService } from '../../../../services/SpaceService/SpaceService';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

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

  selectedSpaceId: number | null = null;

  errorMessage = '';

  confirmingSpaceId: number | null = null;
  confirmingSpaceActive: boolean | null = null;
  processingStatusChange = false;

  constructor(
    private spaceService: SpaceService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadSpaces();
  }

  private loadSpaces(): void {
    this.errorMessage = '';

    this.spaceService.getAllSpaces().subscribe({
      next: spaces => {
        this.spaces = spaces;
      },

      error: error => {
        this.errorMessage =
          this.errorHandler.getMessage(error);
      }
    });
  }

  get filteredSpaces(): SpaceListModel[] {
    const search = this.search.trim().toLowerCase();

    if (!search) {
      return this.spaces;
    }

    return this.spaces.filter(space =>
      space.name?.toLowerCase().includes(search)
    );
  }

  newSpace(): void {
    this.errorMessage = '';
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
    this.errorMessage = '';
    this.selectedSpaceId = spaceId;
    this.showModal = true;
  }

  toggleSpaceStatus(event: { spaceId: number; isActive: boolean }): void {
    this.confirmSpaceStatus(event.spaceId, event.isActive);
  }

  confirmSpaceStatus(spaceId: number, isActive: boolean): void {
    this.confirmingSpaceId = spaceId;
    this.confirmingSpaceActive = isActive;
    this.errorMessage = '';
  }

  cancelSpaceStatus(): void {
    if (this.processingStatusChange) return;

    this.confirmingSpaceId = null;
    this.confirmingSpaceActive = null;
  }

  executeSpaceStatusChange(): void {
    if (
      this.confirmingSpaceId === null ||
      this.confirmingSpaceActive === null ||
      this.processingStatusChange
    ) {
      return;
    }

    this.processingStatusChange = true;
    this.errorMessage = '';

    this.spaceService
      .toggleSpaceStatus(
        this.confirmingSpaceId,
        this.confirmingSpaceActive
      )
      .subscribe({
        next: () => {
          this.processingStatusChange = false;
          this.confirmingSpaceId = null;
          this.confirmingSpaceActive = null;
          this.loadSpaces();
        },
        error: error => {
          this.processingStatusChange = false;
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }
}
