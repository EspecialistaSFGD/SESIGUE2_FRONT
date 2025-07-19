import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { typeErrorControl } from '@core/helpers';
import { OtpForgotComponent } from './otp-forgot/otp-forgot.component';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, OtpForgotComponent],
  templateUrl: './forgot.component.html',
  styles: ``
})
export default class ForgotComponent {
  validate: boolean = false
  loading: boolean = false

  private fb = inject(FormBuilder)

  formForgot: FormGroup = this.fb.group({
    usuario: [ '', Validators.required]
  })

  alertMessageError(control: string) {
    return this.formForgot.get(control)?.errors && this.formForgot.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formForgot.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  recuperarClave(){
    if (this.formForgot.invalid) {
      const invalidFields = Object.keys(this.formForgot.controls).filter(field => this.formForgot.controls[field].invalid);
      console.error('Invalid fields:', invalidFields);
      return this.formForgot.markAllAsTouched();
    }

  }
}
