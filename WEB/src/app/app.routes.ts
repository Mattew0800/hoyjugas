import { Routes } from '@angular/router';
import {LogIn} from './screens/log-in/log-in';
import {Onboarding} from './screens/onboarding/onboarding';
import {SignUp} from './screens/sign-up/sign-up';
import {Error} from './screens/error/error';
import {SplashComponent} from './screens/splash/splash';
import {Home} from './screens/home/home';
import {Booking} from './screens/booking/booking';
import {FieldSchedule} from './screens/field-schedule/field-schedule';
import {BookingConfirmation} from './screens/booking-confirmation/booking-confirmation';
import {PaymentSelection} from './screens/payment-selection/payment-selection';
import {authGuard} from './auth/AuthGuard';
import {guestGuard} from './auth/GuestGuard';


export const routes: Routes = [
  {path:'', component:SplashComponent},
  {path:'onboarding', component:Onboarding,canActivate: [guestGuard]},
  {path:'sign-in', component:LogIn,canActivate: [guestGuard]},
  {path:'sign-up', component:SignUp,canActivate: [guestGuard]},
  {path: 'home', component: Home, canActivate: [authGuard]},
  {path:'booking', component: Booking, canActivate: [authGuard]},
  {path: 'field-schedule', component: FieldSchedule, canActivate: [authGuard]},
  {path: 'booking-confirmation', component: BookingConfirmation, canActivate:[authGuard]},
  {path: 'payment-selection', component: PaymentSelection, canActivate:[authGuard]},
  {path:'**', component:Error}

];
