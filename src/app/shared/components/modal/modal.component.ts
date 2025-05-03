import { Component, Input, Output, EventEmitter, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('modalAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.95)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => *', [
        animate('200ms ease-out')
      ]),
      transition('* => void', [
        animate('150ms ease-in')
      ])
    ]),
    trigger('backdropAnimation', [
      state('void', style({
        opacity: 0
      })),
      state('*', style({
        opacity: 1
      })),
      transition('void => *', [
        animate('200ms ease-out')
      ]),
      transition('* => void', [
        animate('150ms ease-in')
      ])
    ])
  ]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() hideCloseButton = false;
  @Input() preventBackdropClose = false;
  @Input() preventEscClose = false;
  @Input() zIndex = 50;
  
  @Output() closed = new EventEmitter<void>();
  
  animationState: 'void' | '*' = 'void';
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit() {
    // Add the ESC key listener
    if (!this.preventEscClose) {
      document.addEventListener('keydown', this.handleEscKey);
    }
    
    this.updateAnimationState();
  }
  
  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEscKey);
  }
  
  ngOnChanges() {
    this.updateAnimationState();
    
    if (this.isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }
  
  updateAnimationState() {
    this.animationState = this.isOpen ? '*' : 'void';
  }
  
  close() {
    this.closed.emit();
  }
  
  onBackdropClick() {
    if (!this.preventBackdropClose) {
      this.close();
    }
  }
  
  // Prevent propagation of clicks inside the modal content
  onModalClick(event: MouseEvent) {
    event.stopPropagation();
  }
  
  // Close modal on ESC key
  handleEscKey = (event: KeyboardEvent) => {
    if (this.isOpen && event.key === 'Escape') {
      this.close();
    }
  }
  
  onAnimationDone(event: AnimationEvent) {
    // If animation is closing the modal, clean up
    if (event.toState === 'void') {
      document.body.classList.remove('overflow-hidden');
    }
  }
  
  get modalSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-md';
    }
  }
}
