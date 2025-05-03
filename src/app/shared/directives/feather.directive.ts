import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appFeather]',
  standalone: true
})
export class FeatherDirective implements OnInit, OnChanges {
  @Input() appFeather: string = '';
  @Input() size: string = '24';
  @Input() color: string = 'currentColor';
  private feather: any;

  constructor(private elementRef: ElementRef) {}

  async ngOnInit() {
    this.feather = await import('feather-icons');
    this.updateIcon();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appFeather'] || changes['size'] || changes['color']) {
      this.updateIcon();
    }
  }

  private updateIcon() {
    if (!this.appFeather || !this.feather) return;

    const icon = this.feather.icons[this.appFeather];
    if (!icon) {
      console.warn(`Feather icon "${this.appFeather}" not found`);
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