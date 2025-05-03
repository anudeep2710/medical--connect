import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef } from '@angular/core';

@Component({
  selector: 'app-feather-icon',
  template: '',
  standalone: true
})
export class FeatherIconComponent implements OnInit, OnChanges {
  @Input() name: string = '';
  @Input() size: string = '24';
  @Input() color: string = 'currentColor';
  private feather: any;

  constructor(private elementRef: ElementRef) {}

  async ngOnInit() {
    this.feather = await import('feather-icons');
    this.updateIcon();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name'] || changes['size'] || changes['color']) {
      this.updateIcon();
    }
  }

  private updateIcon() {
    if (!this.name || !this.feather) return;

    const icon = this.feather.icons[this.name];
    if (!icon) {
      console.warn(`Feather icon "${this.name}" not found`);
      return;
    }

    const svg = icon.toSvg({
      width: this.size,
      height: this.size,
      color: this.color,
      'stroke-width': 2
    });

    this.elementRef.nativeElement.innerHTML = svg;
  }
}