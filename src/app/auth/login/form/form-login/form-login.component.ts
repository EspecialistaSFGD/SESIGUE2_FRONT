import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { ValidatorService } from '@core/services/validators';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-login.component.html',
  styles: ``
})
export class FormLoginComponent {
  private fb = inject(FormBuilder)
  private validatorService = inject(ValidatorService)

  formLogin:FormGroup = this.fb.group({
    usuario: [ '', [Validators.required,Validators.pattern(this.validatorService.DNIPattern)] ],
    rememberUser: [ '' ],
    clave: ['', Validators.required]
  })

  alertMessageError(control: string) {
    return this.formLogin.get(control)?.errors && this.formLogin.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formLogin.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  login(){
    if (this.formLogin.invalid) {
      const invalidFields = Object.keys(this.formLogin.controls).filter(field => this.formLogin.controls[field].invalid);
      console.error('Invalid fields:', invalidFields);
      return this.formLogin.markAllAsTouched();
    }

  }
}
