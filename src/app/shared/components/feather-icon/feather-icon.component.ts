import { Component, Input, AfterViewInit, ElementRef, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as feather from 'feather-icons';

@Component({
  selector: 'app-feather-icon',
  template: '<i #iconElement></i>',
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `],
  standalone: false
})
export class FeatherIconComponent implements AfterViewInit, OnChanges {
  @Input() name: string = '';
  @Input() size: number = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
  
  @ViewChild('iconElement') iconElement!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    this.updateIcon();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.iconElement && this.iconElement.nativeElement) {
      this.updateIcon();
    }
  }

  private updateIcon(): void {
    if (this.iconElement && this.iconElement.nativeElement && this.name) {
      const element = this.iconElement.nativeElement;
      
      // Set attributes individually to avoid TypeScript indexing issues
      element.setAttribute('data-feather', this.name);
      element.setAttribute('width', String(this.size));
      element.setAttribute('height', String(this.size));
      element.setAttribute('stroke-width', String(this.strokeWidth));
      element.setAttribute('color', this.color);
      
      // Replace with feather icon
      feather.replace({
        width: this.size,
        height: this.size,
        'stroke-width': this.strokeWidth,
        color: this.color
      });
    }
  }
}