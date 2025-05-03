import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'patient',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] },
    loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule)
  },
  {
    path: 'doctor',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['DOCTOR'] },
    loadChildren: () => import('./modules/doctor/doctor.module').then(m => m.DoctorModule)
  },
  {
    path: 'appointments',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/appointments/appointments.module').then(m => m.AppointmentsModule)
  },
  {
    path: 'chat',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule)
  },
  {
    path: 'health-bot',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] },
    loadChildren: () => import('./modules/health-bot/health-bot.module').then(m => m.HealthBotModule)
  },
  {
    path: 'video-call',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/video-call/video-call.module').then(m => m.VideoCallModule)
  },
  { 
    path: '**', 
    redirectTo: 'auth/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }