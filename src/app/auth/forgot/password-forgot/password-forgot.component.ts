import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { typeErrorControl } from '@core/helpers';
import { GenerarClaveResponse } from '@core/interfaces';
import { UsuariosService } from '@core/services/usuarios.service';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-password-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  providers: [MessageService],
  templateUrl: './password-forgot.component.html',
  styles: ``
})
export class PasswordForgotComponent {
  @Input() usuarioClave: GenerarClaveResponse = {}

  loading: boolean = false
  showPassword: boolean = false
  showConfirmPassword: boolean = false

  private fb = inject(FormBuilder)
  private usuarioService = inject(UsuariosService)
  private validatorService = inject(ValidatorService) 
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService)

  formPassword: FormGroup = this.fb.group({
    nuevaClave: [ '', [Validators.required, Validators.pattern(this.validatorService.passwordPattern)] ],
    confirmarClave: ['', Validators.required]
  }, {
    validators: [this.validatorService.controlEquals('nuevaClave', 'confirmarClave')]
  })

  ngOnInit(): void {
    console.log(this.usuarioClave);
  }
    
  alertMessageError(control: string) {
    return this.formPassword.get(control)?.errors && this.formPassword.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formPassword.get(control)?.errors;

    return typeErrorControl(text, errors)
  }


  enviarClave(){
    if (this.formPassword.invalid) {
      const invalidFields = Object.keys(this.formPassword.controls).filter(field => this.formPassword.controls[field].invalid);
      console.error('Invalid fields:', invalidFields);
      return this.formPassword.markAllAsTouched();
    }
    this.actualizarClave()
  }

  actualizarClave() {
    this.loading = true;

    const usuarioClave: GenerarClaveResponse = { ...this.usuarioClave, ...this.formPassword.value };
    this.usuarioService.actualizarContraseña(usuarioClave)
      .subscribe(resp => {
        if(resp.success) {
          this.loading = false;
          this.formPassword.reset();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contraseña cambiada con exito' });
          this.router.navigate(['../login'], { relativeTo: this.route });
        } else {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }
}
