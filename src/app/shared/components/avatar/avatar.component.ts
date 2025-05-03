import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AvatarComponent implements OnInit {
  @Input() src: string = '/assets/default-avatar.svg';
  @Input() alt: string = 'User avatar';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() status?: 'online' | 'offline' | 'busy';
  @Input() name?: string;

  avatarClass: string = '';

  ngOnInit(): void {
    // Set size class
    switch(this.size) {
      case 'sm':
        this.avatarClass = 'width: 32px; height: 32px;';
        break;
      case 'lg':
        this.avatarClass = 'width: 64px; height: 64px;';
        break;
      case 'xl':
        this.avatarClass = 'width: 96px; height: 96px;';
        break;
      case 'md':
      default:
        this.avatarClass = 'width: 48px; height: 48px;';
        break;
    }
    
    // Use name for alt text if provided
    if (this.name && !this.alt) {
      this.alt = this.name;
    }
  }

  onError(): void {
    this.src = '/assets/default-avatar.svg';
  }
}