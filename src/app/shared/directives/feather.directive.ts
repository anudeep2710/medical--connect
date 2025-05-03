import { Directive, ElementRef, Input, OnChanges, SimpleChanges, AfterViewInit, OnInit } from '@angular/core';
import * as feather from 'feather-icons';

@Directive({
  selector: '[appFeather], [feather], i[data-feather]',
  standalone: true
})
export class FeatherDirective implements OnInit, AfterViewInit, OnChanges {
  @Input('appFeather') appIcon!: string;
  @Input('feather') featherIcon!: string;
  @Input('data-feather') dataFeather!: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // If our element already has a data-feather attribute set from the template,
    // we just need to make sure it gets processed by feather.replace()
    if (this.el.nativeElement.hasAttribute('data-feather')) {
      setTimeout(() => {
        feather.replace({
          'stroke-width': 2,
          width: 24,
          height: 24
        });
      });
    }
  }

  ngAfterViewInit() {
    this.updateIcon();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['dataFeather'] && !changes['dataFeather'].firstChange) || 
        (changes['appIcon'] && !changes['appIcon'].firstChange) ||
        (changes['featherIcon'] && !changes['featherIcon'].firstChange)) {
      this.updateIcon();
    }
  }

  private updateIcon() {
    const iconName = this.dataFeather || this.featherIcon || this.appIcon;
    if (iconName) {
      this.el.nativeElement.setAttribute('data-feather', iconName);
      feather.replace({
        'stroke-width': 2,
        width: 24,
        height: 24
      });
    }
  }
}