import { Directive, ElementRef, Input, OnChanges, SimpleChanges, Renderer2 } from '@angular/core';
import * as feather from 'feather-icons';

@Directive({
  selector: '[dynamicFeather]',
  standalone: true
})
export class DynamicFeatherDirective implements OnChanges {
  @Input('dynamicFeather') iconName: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['iconName']) {
      this.updateIcon();
    }
  }

  private updateIcon() {
    if (this.iconName) {
      // Set the data-feather attribute with the dynamic icon name
      this.renderer.setAttribute(this.el.nativeElement, 'data-feather', this.iconName);
      
      // Replace the icon
      setTimeout(() => {
        feather.replace({
          'stroke-width': 2,
          width: 24,
          height: 24
        });
      });
    }
  }
} 