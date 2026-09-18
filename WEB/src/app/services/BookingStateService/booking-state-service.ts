import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';


export interface BookingDraft{
  spaceId: number | null;
  startDateTime: string | null;
  paymentMethod: string | null;
  termsAccepted: boolean | null;
  depositAmount: number | null;
  slots: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class BookingStateService {

  private readonly _draft = new BehaviorSubject<BookingDraft>({
    spaceId: null,
    startDateTime: null,
    paymentMethod: null,
    termsAccepted: null,
    depositAmount: null,
    slots: null
  })

  readonly draft$ = this._draft.asObservable();

  patch(patch: Partial<BookingDraft>){
    this._draft.next({...this._draft.value, ...patch});
  }

  get snapshot(): BookingDraft{
    return this._draft.value;
  }

  reset(){
    this._draft.next({
      spaceId: null,
      startDateTime: null,
      paymentMethod: null,
      termsAccepted: null,
      depositAmount: null,
      slots: null
    })
  }

}
