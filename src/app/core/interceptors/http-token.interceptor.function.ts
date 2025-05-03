import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

export const httpTokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone the request and add auth header if token exists
  const request = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  // Pass the cloned request to the next handler
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle specific error cases
      if (error.status === 401) {
        // Unauthorized - logout user and redirect to login
        authService.purgeAuth();
        router.navigateByUrl('/auth/login');
      }
      return throwError(() => error);
    })
  );
}; 