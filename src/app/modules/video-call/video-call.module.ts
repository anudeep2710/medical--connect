import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { VideoCallComponent } from './video-call/video-call.component';

// Import shared module
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: VideoCallComponent }
];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    VideoCallComponent
  ]
})
export class VideoCallModule { }
