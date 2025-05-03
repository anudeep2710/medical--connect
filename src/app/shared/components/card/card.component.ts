import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherDirective } from '../../directives/feather.directive';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [CommonModule, FeatherDirective]
})
export class CardComponent {
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';
  @Input() bordered: boolean = true;
  @Input() bodyPadding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() headerBorder: boolean = true;
  @Input() footerBorder: boolean = true;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() iconBg: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';
  @Input() hover: boolean = false;

  @ContentChild('header') headerTemplate?: TemplateRef<any>;
  @ContentChild('footer') footerTemplate?: TemplateRef<any>;

  cardClass: string = '';
  bodyClass: string = '';
  iconClasses: string = '';

  ngOnInit(): void {
    this.cardClass = 'card ';
    
    // Add border class if bordered
    if (this.bordered) {
      this.cardClass += 'border ';
    }
    
    // Add shadow class
    if (this.shadow !== 'none') {
      this.cardClass += `shadow-${this.shadow} `;
    }
    
    // Body padding class
    this.bodyClass = `card-body-${this.bodyPadding}`;
  }
}