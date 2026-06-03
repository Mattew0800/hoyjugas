import { Routes } from '@angular/router';
import {LogIn} from './screens/log-in/log-in';
import {Onboarding} from './screens/onboarding/onboarding';
import {SignUp} from './screens/sign-up/sign-up';
import {Error} from './screens/error/error';
import {SplashComponent} from './screens/splash/splash';
import {Home} from './screens/home/home';
import {Booking} from './screens/booking/booking';
import {FieldSchedule} from './screens/field-schedule/field-schedule';

export const routes: Routes = [
  {path:'', component:SplashComponent},
  {path:'onboarding', component:Onboarding},
  {path:'sign-in', component:LogIn},
  {path:'sign-up', component:SignUp},
  {path: 'home', component: Home},
  {path:'booking', component: Booking},
  {path: 'field-schedule', component: FieldSchedule},
  {path:'**', component:Error}

];
