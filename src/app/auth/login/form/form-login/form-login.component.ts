import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { typeErrorControl } from '@core/helpers';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule],
  templateUrl: './form-login.component.html',
  styles: ``
})
export class FormLoginComponent {
  loading: boolean = false
  visiblePassword: boolean = false


  private fb = inject(FormBuilder)
  private validatorService = inject(ValidatorService)
  public authService = inject(AuthService)  
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  formLogin:FormGroup = this.fb.group({
    usuario: [ '', [Validators.required,Validators.pattern(this.validatorService.DNIPattern)] ],
    recordar: [ '' ],
    clave: ['', Validators.required]
  })

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const recordar = localStorage.getItem('usuario') ? true : false
    const usuario = localStorage.getItem('usuario') ? localStorage.getItem('usuario') : null
    this.formLogin.reset({ usuario, recordar })

  }

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

    this.loading = true;
    this.authService.login(this.formLogin.value).subscribe(
      {
        next: (result: any) => {
          if (result.success) {
            if (this.formLogin.get('recordar')?.value != null && this.formLogin.get('recordar')?.value == true) {
              localStorage.setItem('usuario', this.formLogin.get('usuario')?.value);
            } else {
              localStorage.removeItem('usuario');
            }
          } else {
            setTimeout(() => {
              this.formLogin.reset()
            }, 100);
            this.loading = false;
          }
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/panel';
          this.router.navigateByUrl(returnUrl);
          this.loading = false;
        }
      })
  }
}
