import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Shared Components
import { AvatarComponent } from './components/avatar/avatar.component';
import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { InputComponent } from './components/input/input.component';
import { FeatherIconComponent } from './components/feather-icon/feather-icon.component';
import { ModalComponent } from './components/modal/modal.component';

// Directives
import { FeatherDirective } from './directives/feather.directive';

@NgModule({
  declarations: [
    FeatherIconComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ModalComponent,
    CardComponent,
    FeatherDirective,
    ButtonComponent,
    AvatarComponent,
    InputComponent
  ],
  exports: [
    // Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // Components
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    InputComponent,
    FeatherIconComponent,
    ModalComponent,
    
    // Directives
    FeatherDirective
  ]
})
export class SharedModule { }