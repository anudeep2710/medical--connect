import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherDirective } from '../../directives/feather.directive';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  standalone: true,
  imports: [CommonModule, FeatherDirective]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'warning' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() loading: boolean = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() block: boolean = false; // Alias for fullWidth for backward compatibility
  @Output() clicked = new EventEmitter<MouseEvent>();

  getButtonClasses(): string {
    const classes: string[] = [];
    
    // Size classes
    if (this.size === 'sm') {
      classes.push('px-3 py-1.5 text-xs');
    } else if (this.size === 'lg') {
      classes.push('px-5 py-2.5 text-base');
    } else {
      classes.push('px-4 py-2 text-sm');
    }
    
    // Variant classes
    switch (this.variant) {
      case 'primary':
        classes.push('bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500');
        break;
      case 'secondary':
        classes.push('bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500');
        break;
      case 'danger':
        classes.push('bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500');
        break;
      case 'success':
        classes.push('bg-success-600 hover:bg-success-700 text-white focus:ring-success-500');
        break;
      case 'warning':
        classes.push('bg-warning-600 hover:bg-warning-700 text-white focus:ring-warning-500');
        break;
      default: // outline
        classes.push('border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500');
    }
    
    // Width classes
    if (this.fullWidth || this.block) {
      classes.push('w-full');
    }
    
    // Icon position
    if (this.iconPosition === 'right') {
      classes.push('flex-row-reverse');
    } else {
      classes.push('flex-row');
    }
    
    return classes.join(' ');
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}