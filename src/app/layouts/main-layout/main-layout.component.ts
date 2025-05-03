import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/models/user.model';
import { FeatherDirective } from '../../shared/directives/feather.directive';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FeatherDirective]
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarOpen = true;
  activeRoute = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    
    this.activeRoute = this.router.url;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }

  get isPatient(): boolean {
    return this.currentUser?.role === 'PATIENT';
  }

  get isDoctor(): boolean {
    return this.currentUser?.role === 'DOCTOR';
  }

  get dashboardLink(): string {
    return this.isDoctor ? '/doctor/dashboard' : '/patient/dashboard';
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}