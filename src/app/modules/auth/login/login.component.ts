import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FeatherDirective } from '../../../shared/directives/feather.directive';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, FeatherDirective]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error = '';
  showPassword = false;
  selectedRole: 'PATIENT' | 'DOCTOR' = 'PATIENT';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit() {
    // Redirect if already logged in
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.redirectLoggedInUser();
      }
    });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
      role: [this.selectedRole]
    });
  }

  // Form getters for easier access in the template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get rememberMe() { return this.loginForm.get('rememberMe'); }

  setRole(role: 'PATIENT' | 'DOCTOR') {
    this.selectedRole = role;
    this.loginForm.patchValue({ role });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const { email, password, rememberMe, role } = this.loginForm.value;

    this.authService.login({ email, password, role, rememberMe }).subscribe({
      next: () => {
        this.isLoading = false;
        if (rememberMe) {
          // Store credentials in localStorage or secure storage
          localStorage.setItem('rememberedEmail', email);
        }
        this.redirectLoggedInUser();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.error = 'Invalid email or password';
        } else {
          this.error = 'An error occurred. Please try again.';
        }
      }
    });
  }

  private redirectLoggedInUser() {
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.role === 'PATIENT') {
        this.router.navigate(['/patient/dashboard']);
      } else if (user.role === 'DOCTOR') {
        this.router.navigate(['/doctor/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }
}