import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ClientProfileData {
  id: number;
  name: string;
  phone: string;
}

@Component({
  selector: 'app-client-profile-modal',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './client-profile-modal.html',
  styleUrl: './client-profile-modal.scss'
})
export class ClientProfileModal {

  @Input({ required: true })
  client!: ClientProfileData;

  @Output()
  close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  getClientInitial(): string {
    return this.client?.name?.charAt(0)?.toUpperCase() || '?';
  }

}
