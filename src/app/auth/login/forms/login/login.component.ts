import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../../../libs/services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ThemeSwitcherComponent } from '../../../../libs/shared/components/theme-switcher/theme-switcher.component';
import { OnlyNumbersDirective } from '../../../../libs/shared/directives/only-numbers.directive';
import { ValidatorService } from '@core/services/validators';

const claveValidPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\~-]{6,}$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutModule,
    NzFormModule,
    NzButtonModule,
    NzInputModule,
    NzCheckboxModule,
    NzIconModule,
    NzDropDownModule,
    ThemeSwitcherComponent,
    OnlyNumbersDirective,
  ],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {
  @ViewChild('usr') usrElement!: ElementRef;
  @ViewChild('pwd') pwdElement!: ElementRef;

  isLoading: boolean = false;
  isAuthenticated: boolean = true;

  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  private message = inject(NzMessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private validatorService = inject(ValidatorService)

  constructor() {
    this.authService.validarToken().subscribe(estaAutenticado => {
      if (estaAutenticado) {
        this.isAuthenticated = true;
        this.router.navigateByUrl('/panel');
      } else {
        this.isAuthenticated = false;
      }
    });

    this.loginForm = this.fb.group({
      usuario: [
        localStorage.getItem('usuario') || null,
        [Validators.required, Validators.pattern(/^\d{8}$/)]
      ],
      // clave: [null, [Validators.required]],
      clave: [null, [Validators.required, Validators.minLength(4)]],
      recordar: [localStorage.getItem('usuario') != null ? true : false]
    });
  }

  passwordVisible: boolean = false;
  validateUserForm!: UntypedFormGroup;
  loginForm!: UntypedFormGroup;
  hasValidUser: boolean = false;
  //usuario: any;
  loading: boolean = false;
  isVisible = false;
  isOkLoading = false;

  onUsuarioChange(event: string): void {
    if (event == '') {
      this.hasValidUser = false;
    }
  }

  onEnter(event: any): void {
    if (event.keyCode == 13) {
      this.loginForm.valid ? this.onLogin() : this.onNext()
      // if (this.loginForm.valid) {
      //   this.onLogin();
      // } else {
      //   this.onNext();
      // }
    }
  }

  onNext(): void {
    this.loading = true;
    // for (const i in this.validateUserForm.controls) {
    //   this.validateUserForm.controls[i].markAsDirty();
    //   this.validateUserForm.controls[i].updateValueAndValidity();
    // }

    //this.usuario = this.validateUserForm.value;

    setTimeout(() => {
      this.hasValidUser = true;
      this.loading = false;
    }, 500);

    setTimeout(() => {
      this.pwdElement.nativeElement.focus();
    }, 550);
    // this.authService.validarUsuario(this.usuario).subscribe(
    //   result => {
    //     // Handle result
    //     if (result.success && result.data != null) {
    //       this.usuario = result.data;
    //       this.hasValidUser = true;
    //       // console.log(result);

    //       setTimeout(() => { // this will make the execution after the above boolean has changed
    //         this.pwdElement.nativeElement.focus();
    //       }, 100);

    //       if (localStorage.getItem('usuario') != null) {
    //         this.loginForm.get('recordar')?.patchValue(true);
    //       }

    //       // this.message.info(`Bienvenido, ${ this.usuario.nombres }`);
    //     } else {
    //       this.hasValidUser = false;
    //       this.message.error(result.mensaje);
    //     }

    //     //console.log(result);
    //   },
    //   error => {
    //     console.log(error);
    //     this.hasValidUser = false;

    //   },
    //   () => {
    //     this.loading = false;

    //     // 'onCompleted' callback.
    //     // No errors, route to new page here
    //     // this.hasValidUser = true;
    //   }
    // );
  }

  onLogin() {
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe(
      {
        next: (result: any) => {
          if (result.success) {
            // this.hasValidUser = true;
            if (this.loginForm.get('recordar')?.value != null && this.loginForm.get('recordar')?.value == true) {
              localStorage.setItem('usuario', this.loginForm.get('usuario')?.value);
            } else {
              localStorage.removeItem('usuario');
            }

            // const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            // this.router.navigateByUrl(returnUrl);

            // this.authService.obtenerPerfil().subscribe(data => {
            //   console.log(data);

            //   this.authService.obtenerOpciones(data.data[0].id).subscribe(data => {
            //     const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            //     this.router.navigateByUrl(returnUrl);
            //   });
            // });

            // this.trabajadoresService.RecuperarTrabajador().subscribe(() => {
            //   this.authService.obtenerPerfil().subscribe(data => {
            //     this.authService.obtenerOpciones(data.data[0].id).subscribe(data => {
            //       const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            //       this.router.navigateByUrl(returnUrl);
            //     });
            //   });
            // });

          } else {
            //this.usuario.clave = "";
            setTimeout(() => { // this will make the execution after the above boolean has changed
              this.pwdElement.nativeElement.value = "";
              this.usrElement.nativeElement.value = "";

              this.usrElement.nativeElement.focus();
            }, 100);
            this.message.error(result.message);
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/panel';
          this.router.navigateByUrl(returnUrl);
          this.isLoading = false;
        }
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (localStorage.getItem('usuario') != null) {
        this.onNext();
      } else {
        this.hasValidUser = false;
        // this.usrElement.nativeElement.focus();
      }
    }, 100);
  }
}
