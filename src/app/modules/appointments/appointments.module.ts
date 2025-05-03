import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentsListComponent } from './appointments-list/appointments-list.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';

// Import shared module
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: AppointmentsListComponent },
  { path: 'calendar', component: AppointmentCalendarComponent },
  { path: 'book', component: BookAppointmentComponent },
  { path: 'reschedule', component: BookAppointmentComponent }
];

@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    AppointmentsListComponent,
    AppointmentCalendarComponent,
    BookAppointmentComponent
  ]
})
export class AppointmentsModule { }
