import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';

@Component({
  selector: 'app-password-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-forgot.component.html',
  styles: ``
})
export class PasswordForgotComponent {

  loading: boolean = false

  private fb = inject(FormBuilder)

  formPassword: FormGroup = this.fb.group({
    newPassword: [ '', Validators.required ],
    reNewpassword: ['', Validators.required]
  })
    
  alertMessageError(control: string) {
    return this.formPassword.get(control)?.errors && this.formPassword.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formPassword.get(control)?.errors;

    return typeErrorControl(text, errors)
  }


  actualizarClave(){

  }
}
