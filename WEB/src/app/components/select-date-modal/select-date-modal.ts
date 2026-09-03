import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-select-date-modal',
  imports: [],
  templateUrl: './select-date-modal.html',
  styleUrl: './select-date-modal.scss',
})
export class SelectDateModal {

  @Input() isClosing = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<string>();

  selectedDate = '15 de Agosto 2026';

  close() {
    this.onClose.emit();
  }

  confirm() {
    this.onConfirm.emit(this.selectedDate);
    this.close();
  }

}
