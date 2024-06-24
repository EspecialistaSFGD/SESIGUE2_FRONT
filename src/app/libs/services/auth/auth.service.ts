import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsuarioModel, UsuarioRequestModel } from '../../models/auth/usuario.model';
import { environment } from '../../../../environments/environment.development';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { Token } from '../../models/auth/token.model';
import { parseISO } from 'date-fns';
import { ResponseModel } from '../../models/shared/response.model';
import { MenuModel } from '../../models/shared/menu.model';

interface State {
  usuario: string | null | undefined;
  token: string | null | undefined;
  refreshToken: string | null | undefined;
  perfil: string | null | undefined;
  menus: MenuModel[] | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public msg = inject(NzMessageService);
  public http = inject(HttpClient);
  private router = inject(Router);

  #usuario = signal<State>({
    usuario: null,
    token: null,
    refreshToken: null,
    perfil: null,
    menus: null,
    isLoading: false,
    isAuthenticated: false,
  });

  public token = computed(() => this.#usuario().token);
  public reFresh = computed(() => this.#usuario().refreshToken);
  public isAuthenticated = computed(() => this.#usuario().isAuthenticated);
  public isLoading = computed(() => this.#usuario().isLoading);

  constructor() {
    // effect(() => {
    //   if (this.#usuario().perfil) {
    //     localStorage.setItem('perfil', JSON.stringify(this.#usuario().perfil));
    //   }

    //   if (this.#usuario().opciones) {
    //     localStorage.setItem('opciones', JSON.stringify(this.#usuario().opciones));
    //   }


    // });
  }

  login(user: UsuarioRequestModel): Observable<ResponseModel | null> {
    // Aquí realiza tu llamada HTTP para iniciar sesión
    return this.http.post<ResponseModel>(`${environment.api}/Login/Autenticar`, user).pipe(
      tap((resp: ResponseModel) => {
        if (resp.success && resp.data != null) {
          if (resp.data.menus != null) {
            const menusTransformados = this.transformarMenuParaNgZorro(resp.data.menus);
            resp.data.menus = menusTransformados;

            localStorage.setItem('menus', JSON.stringify(resp.data.menus));

            this.#usuario.update((v) => ({
              ...v,
              menus: resp.data.menus,
              isAuthenticated: true,
            }));
          }

          if (resp.data.nombreTrabajador != null) {
            if (resp.data.nombreTrabajador != "") {
              localStorage.setItem('trabajador', resp.data.nombreTrabajador);
            } else {
              localStorage.setItem('trabajador', 'Administrador');
            }
          }

          this.guardarLocalStorage(resp.data.token, resp.data.refreshToken);
          // this.msg.success("Inicio de sesión exitoso");

          // this.#usuario.update((v) => ({ ...v, isLoading: false }));
          //console.log(resp);
        } else {
          this.msg.error("Hubo un error al iniciar sesión");
          this.#usuario.update((v) => ({ ...v, isLoading: false, isAuthenticated: false }));
        }
      }),
      catchError((err) => {
        this.msg.error("Hubo un error al iniciar sesión", err);
        this.#usuario.update((v) => ({ ...v, isLoading: false, isAuthenticated: false }));
        return of(null);
      })
    );
  }

  transformarMenuParaNgZorro(menusApi: MenuModel[]) {
    const menusPrincipales = menusApi.filter(menu => menu.parentMenu === 0);
    const menusTransformados = menusPrincipales.map(menuPrincipal => {
      const subMenus = menusApi.filter(subMenu => subMenu.parentMenu === menuPrincipal.codigoMenu);
      return {
        ...menuPrincipal,
        children: subMenus.map(subMenu => ({
          ...subMenu,
          // Aquí puedes añadir más propiedades o transformaciones si es necesario
        }))
      };
    });

    return menusTransformados;
  }

  obtenerPerfil(): Observable<ResponseModel | null> {
    return this.http.get<ResponseModel>(`${environment.api}/Login/ObtenerPerfil`)
      .pipe(
        tap((resp: any) => {
          localStorage.setItem('perfil', JSON.stringify(resp.data));

          this.#usuario.update((v) => ({
            ...v,
            perfil: resp.data,
          }));
        }),
        catchError(() => of(null))
      );
  }

  obtenerOpciones(idPerfil: number): Observable<ResponseModel | null> {
    return this.http.post<ResponseModel>(`${environment.api}/Login/ObtenerOpciones`, { idPerfil })
      .pipe(
        tap((resp: any) => {
          localStorage.setItem('opciones', JSON.stringify(resp.data));

          this.#usuario.update((v) => ({
            ...v,
            opciones: resp.data,
          }));
        }),
        catchError(() => of(null))
      );
  }

  // loginFull(credentials: any): Observable<ResponseModel | null> {
  //   return this.login(credentials).pipe(
  //     switchMap((response: any) => {
  //       return this.obtenerPerfil().pipe(
  //         switchMap((perfil) => {
  //           //console.log(perfil);

  //           if (perfil == null) {
  //             return of(null);
  //           }
  //           return this.obtenerOpciones(perfil.data[0].id).pipe(
  //             map((opciones) => {
  //               //console.log(opciones);

  //               if (opciones == null) {
  //                 return null;
  //               }
  //               return response;
  //             })
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // }

  logout(): Observable<any> {
    return this.http.get(`${environment.api}/Login/CerrarSesion`)
      .pipe(
        tap((resp: any) => {
          this.removerLocalStorage();
          this.router.navigateByUrl('/login');
        })
      );
  }

  validarToken(): Observable<boolean> {
    let token: string = this.obtenerToken()!;
    let refresh: string = this.obtenerRefreshToken()!;
    let exp: string = this.obtenerExpToken()!;

    if (token === null) {
      return of(false);
    } else {
      const now = new Date();
      const expTime = parseISO(exp);

      if (now < expTime) {
        return of(true);

      } else {
        if ((refresh == null || refresh == undefined) || (token == null || token == undefined)) {
          return of(false);
        }

        return this.renovarAutenticacion(token, refresh).pipe(
          map((resp: any) => {
            //this.router.navigateByUrl('/');
            return true;
          }),
          catchError(error => of(false))
        );
      }
    }
  }

  renovarAutenticacion(token: string, refresh: string): Observable<any> {
    return this.http.post(`${environment.api}/Login/RenovarAutenticacion`, {
      "token": token,
      "refreshToken": refresh
    })
      .pipe(
        tap((resp: any) => {
          this.guardarLocalStorage(resp.data.token, resp.data.refreshToken);

          this.#usuario.update((v) => ({
            ...v,
            token: resp.data.token.codigo,
            refreshToken: resp.data.refreshToken.codigo,
          }));
        })
      );
  }

  obtenerToken(): void | string {
    var token: Token = JSON.parse(localStorage.getItem('token')!);

    if (token == null) {
      return;
    }

    return token.codigo;
  }

  obtenerExpToken(): void | string {
    var token: Token = JSON.parse(localStorage.getItem('token')!);

    if (token == null) {
      return;
    }

    return token.expiracionToken;
  }

  obtenerRefreshToken(): void | string {
    var refresh: Token = JSON.parse(localStorage.getItem('refresh')!);

    if (refresh == null) {
      return;
    }

    return refresh.codigo;
  }

  guardarLocalStorage(token: Token, refresh?: Token): void {
    localStorage.setItem('token', JSON.stringify(token));
    localStorage.setItem('refresh', JSON.stringify(refresh));

    this.#usuario.update((v) => ({
      ...v,
      token: token.codigo,
      refreshToken: refresh?.codigo,
    }));
  }

  removerLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('perfil');
    localStorage.removeItem('menus');

    this.#usuario.set({
      usuario: null,
      token: null,
      refreshToken: null,
      perfil: null,
      menus: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }
}
