import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsuarioModel, UsuarioRequestModel } from '../../models/auth/usuario.model';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { Token } from '../../models/auth/token.model';
import { parseISO } from 'date-fns';
import { ResponseModel } from '../../models/shared/response.model';
import { MenuModel } from '../../models/shared/menu.model';
import { PermisoModel } from '../../models/auth/permiso.model';

interface State {
  usuario: string | null | undefined;
  token: string | null | undefined;
  refreshToken: string | null | undefined;
  perfil: string | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  selectedTheme: string;
}

const DEFAULT_PERMISOS: PermisoModel = {
  puede_agregar_hito: false,
  puede_editar_hito: false,
  puede_eliminar_hito: false,
  puede_validar_hito: false,
  puede_desestimar_hito: false,
  puede_comentar_hito: false,
  puede_agregar_avance: false,
  puede_editar_avance: false,
  puede_eliminar_avance: false,
  puede_validar_avance: false,
  puede_desestimar_avance: false,
  puede_comentar_avance: false,
};

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
    isLoading: false,
    isAuthenticated: false,
    selectedTheme: localStorage['theme'] || 'system',
  });

  public token = computed(() => this.#usuario().token);
  public reFresh = computed(() => this.#usuario().refreshToken);
  public isAuthenticated = computed(() => this.#usuario().isAuthenticated);
  public isLoading = computed(() => this.#usuario().isLoading);
  public selectedTheme = computed(() => this.#usuario().selectedTheme);

  constructor() {
    // effect(() => {
    //   if (this.#usuario().perfil) {
    //     localStorage.setItem('perfil', JSON.stringify(this.#usuario().perfil));
    //   }

    //   if (this.#usuario().opciones) {
    //     localStorage.setItem('opciones', JSON.stringify(this.#usuario().opciones));
    //   }


    // });
    this.initTheme();
  }

  initTheme(): void {
    // console.log(this.selectedTheme());

    if (this.selectedTheme() === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  switchTheme(theme: string): void {
    this.#usuario.update((v) => ({ ...v, selectedTheme: theme }));

    if (theme === 'dark') {
      localStorage['theme'] = 'dark';
    } else if (theme === 'light') {
      localStorage['theme'] = 'light';
    } else {
      localStorage.removeItem('theme');
    }

    this.initTheme();
  }

  login(user: UsuarioRequestModel): Observable<ResponseModel | null> {
    return this.http.post<ResponseModel>(`${environment.api}/Login/Autenticar`, user).pipe(
      tap((resp: ResponseModel) => {
        if (resp.success && resp.data != null) {
          if (resp.data.menus != null) {
            const menusTransformados = this.transformarMenuParaNgZorro(resp.data.menus);
            resp.data.menus = menusTransformados.menusTransformados;
            resp.data.permisos = menusTransformados.permisos;

            localStorage.setItem('menus', JSON.stringify(resp.data.menus));
            localStorage.setItem('permisos', JSON.stringify(resp.data.permisos));

            this.#usuario.update((v) => ({
              ...v,
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

          if (resp.data.codigoUsuario != null && resp.data.codigoUsuario != '') {
            localStorage.setItem('codigoUsuario', resp.data.codigoUsuario);
          }

          if (resp.data.descripcionTipo != null && resp.data.descripcionTipo != '') {
            localStorage.setItem('descripcionTipo', resp.data.descripcionTipo);
          }

          if (resp.data.descripcionSector != null && resp.data.descripcionSector != '') {
            localStorage.setItem('descripcionSector', resp.data.descripcionSector);
          }

          if (localStorage.getItem('isSiderCollapsed') == null) localStorage.setItem('isSiderCollapsed', 'true');

          this.guardarLocalStorage(resp.data.token, resp.data.refreshToken);

          // this.#usuario.update((v) => ({ ...v, isLoading: false }));
          //console.log(resp);
        }

        if (resp.success == null && resp.data == null) {
          this.msg.error(resp.message);
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
    const permisos: PermisoModel = { ...DEFAULT_PERMISOS };

    const menusTransformados = menusPrincipales.map(menuPrincipal => {
      const subMenus = menusApi.filter(subMenu => subMenu.parentMenu === menuPrincipal.codigoMenu);

      // Procesar los botones del menú principal
      if (menuPrincipal.botones && menuPrincipal.botones.length > 0) {
        menuPrincipal.botones.forEach(boton => {
          switch (boton.descripcionBoton) {
            case 'Agregar Hito':
              permisos.puede_agregar_hito = true;
              break;
            case 'Editar Hito':
              permisos.puede_editar_hito = true;
              break;
            case 'Eliminar Hito':
              permisos.puede_eliminar_hito = true;
              break;
            case 'Validar Hito':
              permisos.puede_validar_hito = true;
              break;
            case 'Desestimar Hito':
              permisos.puede_desestimar_hito = true;
              break;
            case 'Comentar Hito':
              permisos.puede_comentar_hito = true;
              break;
            case 'Agregar Avance':
              permisos.puede_agregar_avance = true;
              break;
            case 'Editar Avance':
              permisos.puede_editar_avance = true;
              break;
            case 'Eliminar Avance':
              permisos.puede_eliminar_avance = true;
              break;
            case 'Validar Avance':
              permisos.puede_validar_avance = true;
              break;
            case 'Desestimar Avance':
              permisos.puede_desestimar_avance = true;
              break;
            case 'Comentar Avance':
              permisos.puede_comentar_avance = true;
              break;
            default:
              console.warn(`Descripción de botón no reconocida: ${boton.descripcionBoton}`);
              break;
          }
        });
      }

      return {
        ...menuPrincipal,
        children: subMenus.map(subMenu => ({
          ...subMenu,
          botones: undefined // Eliminar la propiedad botones del submenú
        })),
        botones: undefined // Eliminar la propiedad botones del menú principal
      };
    });

    return { menusTransformados, permisos };
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

  logout(): Observable<any> {
    return this.http.get(`${environment.api}/Login/CerrarSesion`)
      .pipe(
        tap((resp: any) => {
          this.removerLocalStorage();
          this.router.navigateByUrl('/auth/login');
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
          this.removerLocalStorage();
          return of(false);
        }

        this.removerLocalStorage();

        return of(false);

        // return this.renovarAutenticacion(token, refresh).pipe(
        //   map((resp: any) => {
        //     return true;
        //   }),
        //   catchError(error => of(false))
        // );
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
    localStorage.removeItem('codigoUsuario');
    localStorage.removeItem('trabajador');
    localStorage.removeItem('descripcionTipo');
    localStorage.removeItem('descripcionSector');
    localStorage.removeItem('permisos');

    this.#usuario.set({
      usuario: null,
      token: null,
      refreshToken: null,
      perfil: null,
      isLoading: false,
      isAuthenticated: false,
      selectedTheme: localStorage['theme'] || 'system',
    });
  }
}

