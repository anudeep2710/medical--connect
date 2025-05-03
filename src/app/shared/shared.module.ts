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
import { DynamicFeatherDirective } from './directives/dynamic-feather.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ModalComponent,
    CardComponent,
    FeatherDirective,
    DynamicFeatherDirective,
    ButtonComponent,
    AvatarComponent,
    InputComponent,
    FeatherIconComponent
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
    FeatherDirective,
    DynamicFeatherDirective
  ]
})
export class SharedModule { }