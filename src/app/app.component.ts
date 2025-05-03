import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import * as feather from 'feather-icons';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Initialize Feather icons
    this.initFeatherIcons();

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

  private initFeatherIcons() {
    feather.replace({
      'stroke-width': 1.5,
      width: 20,
      height: 20
    });
    
    // Re-render icons when route changes
    this.router.events.subscribe(() => {
      setTimeout(() => {
        feather.replace({
          'stroke-width': 1.5,
          width: 20,
          height: 20
        });
      }, 100);
    });
  }
}