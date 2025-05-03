import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isLoading = false;
      
      if (this.currentUser) {
        // Redirect based on user role
        if (this.currentUser.role === 'DOCTOR') {
          this.router.navigate(['/doctor/dashboard']);
        } else if (this.currentUser.role === 'PATIENT') {
          this.router.navigate(['/patient/dashboard']);
        }
      } else {
        // No authenticated user, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}