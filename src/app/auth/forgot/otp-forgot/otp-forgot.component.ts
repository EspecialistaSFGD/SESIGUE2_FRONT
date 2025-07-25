import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { PasswordForgotComponent } from '../password-forgot/password-forgot.component';
import { GenerarClaveResponse } from '@core/interfaces';
import { AuthService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-otp-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordForgotComponent, PrimeNgModule],
  providers: [MessageService],
  templateUrl: './otp-forgot.component.html',
  styles: ``
})
export class OtpForgotComponent {
  @Input() usuarioClave: GenerarClaveResponse = {}
  validate: boolean = false
  loading: boolean = false


  private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private messageService = inject(MessageService)

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
    const otpData: GenerarClaveResponse = { ...this.usuarioClave, codigo };

    this.authService.validarOtp(otpData)
      .subscribe(resp => {
        if(resp.success) {
          this.loading = false;
          this.validate = true;
          this.usuarioClave = { ...this.usuarioClave, codigo: resp.data?.codigo };
          this.messageService.add({ severity: 'success', summary: 'Validado', detail: 'Código validado' });
          this.formOtpForgot.reset();
        } else {
          this.loading = false;
          this.validate = false;
          delete this.usuarioClave.codigo;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }
}
