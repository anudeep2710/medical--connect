import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, CommonModule]
})
export class AppComponent implements OnInit {
  title = 'health-connect';
  private feather: any;
  isDarkMode = false;

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    this.feather = await import('feather-icons');
    this.feather.replace();

    // Set dark mode based on saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    }

    // Check authentication state and redirect accordingly
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        const user = this.authService.getCurrentUser();
        if (user?.role === 'DOCTOR') {
          this.router.navigateByUrl('/doctor/dashboard');
        } else if (user?.role === 'PATIENT') {
          this.router.navigateByUrl('/patient/dashboard');
        }
      }
    });
  }
  
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Dark mode enabled');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Light mode enabled');
    }

    // Force style recalculation for Tailwind classes
    document.body.classList.add('theme-transition');
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
  }
}