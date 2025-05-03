import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HealthBotComponent } from './health-bot/health-bot.component';

// Import shared module
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: HealthBotComponent }
];

@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class HealthBotModule { }
