import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { PasswordForgotComponent } from '../password-forgot/password-forgot.component';
import { GenerarClaveResponse } from '@core/interfaces';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-otp-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordForgotComponent],
  templateUrl: './otp-forgot.component.html',
  styles: ``
})
export class OtpForgotComponent {
  @Input() recuperarClaveData: GenerarClaveResponse = {}
  validate: boolean = false
  loading: boolean = false


  private fb = inject(FormBuilder)
    private authService = inject(AuthService)

  formOtpForgot: FormGroup = this.fb.group({
    otp: ['', Validators.required]
  })
  
  alertMessageError(control: string) {
    return this.formOtpForgot.get(control)?.errors && this.formOtpForgot.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formOtpForgot.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  enviarOtp(){
    if (this.formOtpForgot.invalid) {
      const invalidFields = Object.keys(this.formOtpForgot.controls).filter(field => this.formOtpForgot.controls[field].invalid);
      console.error('Invalid fields:', invalidFields);
      return this.formOtpForgot.markAllAsTouched();
    }
    this.validarOtp();
  }

  validarOtp(){
    this.loading = true;
    const codigo = this.formOtpForgot.get('otp')?.value;
    const otpData: GenerarClaveResponse = { ...this.recuperarClaveData, codigo };

    this.authService.validarOtp(otpData).subscribe({
      next: (response) => {
        this.loading = false;
        this.validate = true;
        this.recuperarClaveData = { ...this.recuperarClaveData, codigo: response?.data?.codigo };
        this.formOtpForgot.reset();
      },
      error: (error) => {
        this.loading = false;
        this.validate = false;
        delete this.recuperarClaveData.codigo;
      }
    });
  }
}
