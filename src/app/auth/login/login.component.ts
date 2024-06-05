import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../libs/services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutModule,
    NzFormModule,
    NzButtonModule,
    NzInputModule,
    NzCheckboxModule,
    NzIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less'
})
export class LoginComponent {
  @ViewChild('usr') usrElement!: ElementRef;
  @ViewChild('pwd') pwdElement!: ElementRef;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.authService.validarToken().subscribe(estaAutenticado => {
      if (estaAutenticado) {
        this.router.navigateByUrl('/panel');
      }
    });

    this.loginForm = this.fb.group({
      usuario: [localStorage.getItem('usuario') || null, [Validators.required]],
      clave: [null, [Validators.required]],
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
      if (this.loginForm.valid) {
        this.onLogin();
      } else {
        this.onNext();
      }
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
    this.authService.loginFull(this.loginForm.value).subscribe(
      {
        next: (result: any) => {
          if (result.success) {
            this.hasValidUser = true;

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
              this.pwdElement.nativeElement.focus();
            }, 100);
            this.message.error(result.message);
            this.loading = false;
          }
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        }
      }
    );
  }

  ngOnInit(): void {
    // this.validateUserForm = this.fb.group({
    //   // usuario: [this.usuario?.nombreUsuario, [Validators.required]],
    //   usuario: [localStorage.getItem('usuario') || '', [Validators.required]],
    // });

    setTimeout(() => {
      if (localStorage.getItem('usuario') != null) {
        this.onNext();
      } else {
        this.hasValidUser = false;
        this.usrElement.nativeElement.focus();
      }
    }, 100);
  }
}
