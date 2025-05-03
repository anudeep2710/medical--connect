import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FeatherDirective } from '../../../shared/directives/feather.directive';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FeatherDirective]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  returnUrl = '/';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Initialize form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
      role: ['PATIENT', Validators.required]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Auto-fill with demo credentials for quick testing
    if (this.loginForm.get('role')?.value === 'PATIENT') {
      this.loginForm.patchValue({
        email: 'demo@example.com',
        password: 'password123'
      });
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({
      email: this.f['email'].value,
      password: this.f['password'].value,
      rememberMe: this.f['rememberMe'].value,
      role: this.f['role'].value
    })
    .subscribe({
      next: () => {
        // Navigate based on user role
        if (this.f['role'].value === 'DOCTOR') {
          this.router.navigate(['/doctor/dashboard']);
        } else {
          this.router.navigate(['/patient/dashboard']);
        }
      },
      error: error => {
        this.error = error.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }

  toggleRole() {
    const currentRole = this.f['role'].value;
    const newRole = currentRole === 'PATIENT' ? 'DOCTOR' : 'PATIENT';
    
    this.loginForm.patchValue({
      role: newRole,
      email: newRole === 'DOCTOR' ? 'doctor@example.com' : 'patient@example.com',
      password: newRole === 'DOCTOR' ? 'doctor123' : 'patient123'
    });
  }
}