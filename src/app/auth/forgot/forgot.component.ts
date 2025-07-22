import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { typeErrorControl } from '@core/helpers';
import { OtpForgotComponent } from './otp-forgot/otp-forgot.component';
import { AuthService } from '@core/services';
import { GenerarClaveResponse } from '@core/interfaces';

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
  claveUsuario: GenerarClaveResponse = {}

  private fb = inject(FormBuilder)
  private authService = inject(AuthService)

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
    this.generarOtp();
  }

  generarOtp() {
    this.loading = true;
    const usuario = this.formForgot.get('usuario')?.value;
    this.authService.obtenerOtp(usuario).subscribe({
      next: (response) => {
        this.loading = false;
        this.validate = true
        this.claveUsuario = { email: response?.data?.email, usuario }
        this.formForgot.reset();
      },
      error: (error) => {
        this.loading = false;
        this.validate = false
        delete this.claveUsuario.email;
        delete this.claveUsuario.usuario;
      }
    });
  }
}
