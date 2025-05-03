import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FeatherDirective } from '../../../shared/directives/feather.directive';

// Custom validator to check if passwords match
const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  return password && confirmPassword && password.value !== confirmPassword.value 
    ? { passwordMismatch: true } 
    : null;
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, FeatherDirective]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;
  
  specializationOptions = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Obstetrics',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Urology'
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.createForm();
  }
  
  ngOnInit() {
    // Redirect if already logged in
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.redirectLoggedInUser();
      }
    });
    
    // Update validators when role changes
    this.role?.valueChanges.subscribe(role => {
      if (role === 'DOCTOR') {
        this.addDoctorValidators();
      } else {
        this.removeDoctorValidators();
      }
    });
  }
  
  // Form creation
  private createForm(): FormGroup {
    return this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['PATIENT'],
      agreeToTerms: [false, [Validators.requiredTrue]],
      licenseNumber: [''],
      specialization: [''],
      affiliation: [''],
      yearsOfExperience: ['']
    }, { validators: passwordMatchValidator });
  }
  
  // Add validators for doctor fields
  private addDoctorValidators() {
    this.registerForm.get('licenseNumber')?.setValidators([Validators.required]);
    this.registerForm.get('specialization')?.setValidators([Validators.required]);
    this.registerForm.get('affiliation')?.setValidators([Validators.required]);
    this.registerForm.get('yearsOfExperience')?.setValidators([
      Validators.required, 
      Validators.min(0), 
      Validators.max(70)
    ]);
    
    // Update validity
    this.registerForm.get('licenseNumber')?.updateValueAndValidity();
    this.registerForm.get('specialization')?.updateValueAndValidity();
    this.registerForm.get('affiliation')?.updateValueAndValidity();
    this.registerForm.get('yearsOfExperience')?.updateValueAndValidity();
  }
  
  // Remove validators for doctor fields
  private removeDoctorValidators() {
    this.registerForm.get('licenseNumber')?.clearValidators();
    this.registerForm.get('specialization')?.clearValidators();
    this.registerForm.get('affiliation')?.clearValidators();
    this.registerForm.get('yearsOfExperience')?.clearValidators();
    
    // Update validity
    this.registerForm.get('licenseNumber')?.updateValueAndValidity();
    this.registerForm.get('specialization')?.updateValueAndValidity();
    this.registerForm.get('affiliation')?.updateValueAndValidity();
    this.registerForm.get('yearsOfExperience')?.updateValueAndValidity();
  }
  
  // Form getters for easier access in the template
  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get role() { return this.registerForm.get('role'); }
  get licenseNumber() { return this.registerForm.get('licenseNumber'); }
  get specialization() { return this.registerForm.get('specialization'); }
  get affiliation() { return this.registerForm.get('affiliation'); }
  get yearsOfExperience() { return this.registerForm.get('yearsOfExperience'); }
  get agreeToTerms() { return this.registerForm.get('agreeToTerms'); }
  
  // Set role when toggled
  setRole(role: string) {
    this.registerForm.patchValue({ role });
  }
  
  onSubmit() {
    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    // Extract registration data
    const registrationData = {
      fullName: this.fullName?.value,
      email: this.email?.value,
      password: this.password?.value,
      role: this.role?.value,
      ...(this.role?.value === 'DOCTOR' && {
        licenseNumber: this.licenseNumber?.value,
        specialization: this.specialization?.value,
        affiliation: this.affiliation?.value,
        yearsOfExperience: this.yearsOfExperience?.value
      })
    };
    
    this.authService.register(registrationData).subscribe({
      next: () => {
        this.isLoading = false;
        this.redirectLoggedInUser();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.error = 'Email already in use. Please use a different email.';
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      }
    });
  }
  
  // Redirect based on user role
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
