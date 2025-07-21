import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { PasswordForgotComponent } from '../password-forgot/password-forgot.component';

@Component({
  selector: 'app-otp-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordForgotComponent],
  templateUrl: './otp-forgot.component.html',
  styles: ``
})
export class OtpForgotComponent {
  validate: boolean = false
  loading: boolean = false

  private fb = inject(FormBuilder)

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

  validarOtp(){
    
  }
}
