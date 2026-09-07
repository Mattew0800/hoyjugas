import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pin-modal',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './pin-modal.html',
  styleUrl: './pin-modal.scss'
})
export class PinModal {

  @Input() employeeName = '';

  @Output() close = new EventEmitter<void>();

  @Output() confirm = new EventEmitter<{
    pin: string;
    confirmPin: string;
  }>();

  pin = '';

  confirmPin = '';

  pinError = '';

  saving = false;


  save(): void {

    this.pinError = '';

    const pin = this.pin.trim();
    const confirmation = this.confirmPin.trim();

    if (!pin) {
      this.pinError = 'Ingresá un nuevo PIN.';
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      this.pinError = 'El PIN debe tener exactamente 4 números.';
      return;
    }

    if (!confirmation) {
      this.pinError = 'Confirmá el nuevo PIN.';
      return;
    }

    if (pin !== confirmation) {
      this.pinError = 'Los PIN no coinciden.';
      return;
    }

    this.confirm.emit({
      pin,
      confirmPin: confirmation
    });

  }


  closeModal(): void {

    this.close.emit();

  }

}
