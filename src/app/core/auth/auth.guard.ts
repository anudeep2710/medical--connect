import { Injectable } from '@angular/core';
import { 
  Router, 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot 
} from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
      take(1),
      map(isAuthenticated => {
        // Check if the user is authenticated
        if (!isAuthenticated) {
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        // Check if the route has any role requirements
        const requiredRoles = route.data['roles'] as string[];
        if (requiredRoles && requiredRoles.length > 0) {
          // Check if the user has the required role
          const hasRequiredRole = this.authService.hasRole(requiredRoles);
          if (!hasRequiredRole) {
            // If user doesn't have the required role, redirect to appropriate dashboard
            const currentUser = this.authService.getCurrentUser();
            if (currentUser?.role === 'DOCTOR') {
              this.router.navigate(['/doctor/dashboard']);
            } else if (currentUser?.role === 'PATIENT') {
              this.router.navigate(['/patient/dashboard']);
            } else {
              this.router.navigate(['/auth/login']);
            }
            return false;
          }
        }

        return true;
      })
    );
  }
}