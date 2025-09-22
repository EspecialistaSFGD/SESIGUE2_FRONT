import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthLoginModel, AuthRequestModel, UsuarioModel, UsuarioRequestModel } from '../../models/auth/usuario.model';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, first, map, of, switchMap, tap } from 'rxjs';
import { Token } from '../../models/auth/token.model';
import { parseISO } from 'date-fns';
import { ResponseModel } from '../../models/shared/response.model';
import { MenuModel } from '../../models/shared/menu.model';
import { PermisoModel } from '../../models/auth/permiso.model';
import { SelectModel } from '../../models/shared/select.model';
import { PedidoType } from '../../shared/types/pedido.type';
import { ItemEnum, UsuarioNavigation, UsuarioPermisos } from '@core/interfaces';

const codigoUsuario = Number(localStorage.getItem('codigoUsuario')) || 0;
const codigoPerfil = Number(localStorage.getItem('codigoPerfil')) || 0;

interface State {
  usuario: string | null | undefined;
  nombreTrabajador: string | null;
  token: string | null | undefined;
  refreshToken: string | null | undefined;
  perfil: string | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  subTipo: PedidoType;
  canViewPedidos: boolean;
  selectedTheme: string;
  entidad: string | null,
  departamento: SelectModel | null;
  provincia: SelectModel | null;
  distrito: SelectModel | null;
  sector: SelectModel | null;
  permisos: PermisoModel | null;
  codigoPerfil: number | null,
  navigation: UsuarioNavigation[] | null
}

const DEFAULT_PERMISOS: PermisoModel = {
  puede_agregar_hito: false,
  puede_editar_hito: false,
  puede_eliminar_hito: false,
  puede_validar_hito: false,
  puede_desestimar_hito: false,
  puede_comentar_hito: false,
  puede_reactivar_estado_hito: false,
  puede_agregar_avance: false,
  puede_editar_avance: false,
  puede_eliminar_avance: false,
  // puede_validar_avance: false,
  puede_desestimar_avance: false,
  puede_comentar_avance: false,
  puede_agregar_pedido: false,
  puede_editar_pedido: false,
  puede_eliminar_pedido: false,
  puede_validar_pedido: false,
  puede_comentar_pedido_pcm: false,
  puede_agregar_acuerdo: false,
  puede_agregar_acuerdo_mt: false,
  puede_editar_acuerdo: false,
  puede_eliminar_acuerdo: false,
  puede_convertir_preacuerdo: false,
  puede_solicitar_desestimacion: false,
  puede_validar_avance_sector: false,
  puede_validar_avance_pcm: false,
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
    nombreTrabajador: this.getNombreTrabajador(),
    token: this.obtenerToken(),
    refreshToken: null,
    perfil: null,
    isLoading: false,
    isAuthenticated: false,
    subTipo: this.getSubTipo(),
    canViewPedidos: false,
    selectedTheme: localStorage['theme'] || 'system',
    entidad: null,
    departamento: this.getDepartamentoSelect(),
    provincia: this.getProvinciaSelect(),
    distrito: this.getDistritoSelect(),
    sector: this.getSectorSelect(),
    permisos: this.getPermisos(),
    codigoPerfil: this.getCodigoPerfil(),
    navigation: this.getNavigation()
  });

  public usuarioAuth = computed(() => this.#usuario())

  // private _navigationAuth = signal<UsuarioNavigation[]>([])
  public navigationAuth = computed(() => this.#usuario().navigation)

  public nombreTrabajador = computed(() => this.#usuario().nombreTrabajador);
  public token = computed(() => this.#usuario().token);
  public reFresh = computed(() => this.#usuario().refreshToken);
  public isAuthenticated = computed(() => this.#usuario().isAuthenticated);
  public subTipo = computed(() => this.#usuario().subTipo);
  public canViewPedidos = computed(() => this.subTipo() !== 'EJECUTORA');
  public isLoading = computed(() => this.#usuario().isLoading);
  public selectedTheme = computed(() => this.#usuario().selectedTheme);
  public departamento = computed(() => this.#usuario().departamento);
  public provincia = computed(() => this.#usuario().provincia);
  public distrito = computed(() => this.#usuario().distrito);
  public sector = computed(() => this.#usuario().sector);
  public permisos = computed(() => this.#usuario().permisos);
  public codigoPerfil = computed(() => this.#usuario().codigoPerfil);
  public entidad = computed(() => this.#usuario().entidad);

  constructor() {
    this.initTheme();
  }

  login(user: AuthLoginModel): Observable<ResponseModel | null> {
    let ots: AuthRequestModel = {} as AuthRequestModel;
    ots.numeroDocumento = user.usuario;
    ots.clave = user.clave;

    return this.http.post<ResponseModel>(`${environment.api}/Login/Autenticar`, ots).pipe(
      tap((resp: ResponseModel) => {
        const data = resp.data;
        
        if (resp.success && data != null) {
          if (data.menus != null) {
            this.#usuario.update((v) => ({ ...v, navigation: data.menus }));

            const menusTransformados = this.transformarMenuParaNgZorro(data.menus);
            data.menus = menusTransformados.menusTransformados;
            data.permisos = menusTransformados.permisos;
            data.menus.map((menu: MenuModel) => {
              if (menu.esExterno) {
                let sup = 0
                if(Number(data.sector) != 0){
                  sup = data.entidad == 3402 ? 2 : 1
                }

                const departamento = data.ubigeoEntidad ? Number(data.ubigeoEntidad.slice(0,2)) : 0
                const ubigeo = data.ubigeoEntidad ? Number(data.ubigeoEntidad) : 0
                const sector = data.sector ? data.sector : 0
                const entidadId = data.entidad
                const usuarioId = data.codigoUsuario

                const aliasDataParams: ItemEnum[] = [
                  { value: 'UBIGEO', text: `${ubigeo}` },
                  { value: 'DEPARTAMENTO_ID', text: `${departamento}` },
                  { value: 'SECTOR_ID', text: sector },
                  { value: 'ENTIDAD_ID', text: entidadId },
                  { value: 'USUARIO_ID', text: usuarioId },
                  { value: 'SUP_ID', text: sup }
                ]
                
                let paramsUrl = menu.paramsUrl
                const paramsNav = paramsUrl.split('&')
                for(let param of paramsNav){
                  const alias = param.split('=')[1]
                  const firstChar = alias[0];
                  const lastChar = alias[alias.length - 1];
                  
                  if(firstChar === '[' && lastChar === ']' ){
                    const getAlias = alias.slice(1, -1);
                    const valueToAlias = aliasDataParams.find(item => item.value === getAlias )?.text
                    paramsUrl = paramsUrl.replaceAll(alias, `${valueToAlias}`)
                  }
                }
                // menu.direccionUrl = `${menu.direccionUrl}au=0&7B611A09B990B80849DBE7AF822D63E466D552839D9EC6E0=2B6AC8BbF4ADF440005AFC42EF337555FB0008BF9770791Z&gjXtIkEroS=SD_SSFD&codevento=62&ubig=0&de=&en=${data.entidad}&codsector=${data.sector}&iacp=${data.codigoUsuario}&sup=1`
                // menu.direccionUrl = `${menu.direccionUrl}au=0&7B611A09B990B80849DBE7AF822D63E466D552839D9EC6E0=2B6AC8BbF4ADF440005AFC42EF337555FB0008BF9770791Z&gjXtIkEroS=SD_SSFD&ubig=${Number(ubigeo)}&de=6&en=${data.entidad}&codsector=${sector}&iacp=${data.codigoUsuario}&sup=${sup}`
                menu.direccionUrl = `${menu.direccionUrl}${paramsUrl}`
              }
            })

            localStorage.setItem('menus', JSON.stringify(data.menus));
            localStorage.setItem('permisos', JSON.stringify(data.permisos));
            localStorage.setItem('permisosPcm', JSON.stringify(data.permisosPcm));

            this.#usuario.update((v) => ({ ...v, permisos: data.permisos }));
            this.#usuario.update((v) => ({ ...v, isAuthenticated: true }));
          }

          // this.#usuario.update((v) => ({ ...v, perfil: data.perfil }));

          if (data.nombreTrabajador != null) {
            if (data.nombreTrabajador != "") {
              localStorage.setItem('trabajador', data.nombreTrabajador);
            } else {
              localStorage.setItem('trabajador', 'Administrador');
            }

            this.#usuario.update((v) => ({ ...v, nombreTrabajador: data.nombreTrabajador }));
          }

          if (data.codigoUsuario != null && data.codigoUsuario != '') {
            localStorage.setItem('codigoUsuario', data.codigoUsuario);
          }

          if (data.entidad != null) {
            this.#usuario.update((v) => ({ ...v, entidad: data.entidad }));
            localStorage.setItem('entidad', data.entidad);
          }

          if (data.codigoPerfil != null && data.codigoPerfil != '') {
            this.#usuario.update((v) => ({ ...v, codigoPerfil: data.codigoPerfil }));
            localStorage.setItem('codigoPerfil', data.codigoPerfil);
          }

          if (data.descripcionTipo != null && data.descripcionTipo != '') {
            localStorage.setItem('descripcionTipo', data.descripcionTipo);
          }

          if (data.descripcionSector != null && data.descripcionSector != '') {
            localStorage.setItem('descripcionSector', data.descripcionSector);
          }

          if (data.codigoDepartamento != null && data.codigoDepartamento != '' && data.departamento != null && data.departamento != '') {
            const dep = new SelectModel(data.codigoDepartamento, data.departamento);
            localStorage.setItem('departamento', JSON.stringify(dep));
            this.#usuario.update((v) => ({ ...v, departamento: dep }));
          }

          if (data.codigoProvincia != null && data.codigoProvincia != '' && data.provincia != null && data.provincia != '') {
            const prov = new SelectModel(data.codigoProvincia, data.provincia);
            localStorage.setItem('provincia', JSON.stringify(prov));
            this.#usuario.update((v) => ({ ...v, provincia: prov }));
          }

          if (data.codigoDistrito != null && data.codigoDistrito != '' && data.distrito != null && data.distrito != '') {
            const dist = new SelectModel(data.codigoDistrito, data.distrito);
            localStorage.setItem('distrito', JSON.stringify(dist));
            this.#usuario.update((v) => ({ ...v, distrito: dist }));
          }

          if (data.sector != null && data.descripcionSector != null) {
            const sector = new SelectModel(data.sector, data.descripcionSector);
            localStorage.setItem('sector', JSON.stringify(sector));
            this.#usuario.update((v) => ({ ...v, sector: sector }));
          }

          if (data.codigoNivel != null) {
            localStorage.setItem('codigoNivel', data.codigoNivel);
          }

          if (data.descripcionNivel != null) {
            localStorage.setItem('nivel', data.descripcionNivel);
          }

          if (data.codigoSubTipo != null) {
            localStorage.setItem('codigoSubTipo', data.codigoSubTipo);
          }

          if (data.descripcionSubTipo != null) {
            localStorage.setItem('subTipo', data.descripcionSubTipo);
            this.#usuario.update((v) => ({ ...v, subTipo: data.descripcionSubTipo.toUpperCase() as PedidoType }));
          }

          if (data.sector != null) {
            localStorage.setItem('codigoSector', data.sector);
          }

          if (localStorage.getItem('isSiderCollapsed') == null) localStorage.setItem('isSiderCollapsed', 'true');

          this.guardarLocalStorage(data.token, data.refreshToken);

          // this.#usuario.update((v) => ({ ...v, isLoading: false }));
          //console.log(resp);
        }

        if (resp.success == null && data == null) {
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
            case 'Reactivar Estado Hito':
              permisos.puede_reactivar_estado_hito = true;
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
            // case 'Validar Avance':
            //   permisos.puede_validar_avance = true;
            //   break;
            case 'Desestimar Avance':
              permisos.puede_desestimar_avance = true;
              break;
            case 'Comentar Avance':
              permisos.puede_comentar_avance = true;
              break;
            case 'Agregar Pedido':
              permisos.puede_agregar_pedido = true;
              break;
            case 'Editar Pedido':
              permisos.puede_editar_pedido = true;
              break;
            case 'Eliminar Pedido':
              permisos.puede_eliminar_pedido = true;
              break;
            case 'Validar Pedido':
              permisos.puede_validar_pedido = true;
              break;
            case 'Comentar PCM':
              permisos.puede_comentar_pedido_pcm = true;
              break;
            case 'Agregar Acuerdo':
              permisos.puede_agregar_acuerdo = true;
              break;
            case 'Agregar Acuerdo MT':
              permisos.puede_agregar_acuerdo_mt = true;
              break;
            case 'Editar Acuerdo':
              permisos.puede_editar_acuerdo = true;
              break;
            case 'Eliminar Acuerdo':
              permisos.puede_eliminar_acuerdo = true;
              break;
            case 'Convertir PreAcuerdo':
              permisos.puede_convertir_preacuerdo = true;
              break
            case 'Agregar PreAcuerdo':
              permisos.puede_agregar_acuerdo = true;
              break;
            case 'Solicitar Desestimación':
              permisos.puede_solicitar_desestimacion = true;
              break;
            case 'Validar Avance Sector':
              permisos.puede_validar_avance_sector = true;
              break;
            case 'Validar Avance PCM':
              permisos.puede_validar_avance_pcm = true;
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
          // botones: undefined // Eliminar la propiedad botones del submenú
        })),
        // botones: undefined // Eliminar la propiedad botones del menú principal
      };
    });

    return { menusTransformados, permisos };
  }

  initTheme(): void {
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

  private getNombreTrabajador(): string {
    const nombreTrabajador = localStorage.getItem('trabajador') || 'Administrador';

    return nombreTrabajador;
  }

  private getPermisos(): PermisoModel | null {
    const permisosFromStorage = localStorage.getItem('permisos') || null;

    if (permisosFromStorage == null) return null;

    const permisos = JSON.parse(permisosFromStorage) as PermisoModel;

    return permisos;
  }

  private getNavigation(): UsuarioNavigation[] | null {
    const navigationStorage = localStorage.getItem('menus') || null;

    if (navigationStorage == null) return null;

    const navigation = JSON.parse(navigationStorage) as UsuarioNavigation[];

    return navigation;
  }

  private getSubTipo(): PedidoType | null {
    const storedSubTipo = localStorage.getItem('subTipo') || null;
    const subTipoFromStorage: PedidoType = (storedSubTipo?.toUpperCase() as PedidoType) || null;

    return subTipoFromStorage;
  }

  private getSectorSelect(): SelectModel | null {
    const selectSector = localStorage.getItem('sector') || null;

    if (selectSector == null) return null;

    const sectorSelect = JSON.parse(selectSector) as SelectModel;

    return sectorSelect;
  }

  private getDepartamentoSelect(): SelectModel | null {
    const codigoDepartamento = localStorage.getItem('departamento') || null;
    if (codigoDepartamento == null) return null;

    const departamentoSelect = JSON.parse(codigoDepartamento) as SelectModel;

    return departamentoSelect;
  }

  private getProvinciaSelect(): SelectModel | null {
    const codigoProvincia = localStorage.getItem('provincia') || null;
    if (codigoProvincia == null) return null;
    const provinciaSelect = JSON.parse(codigoProvincia) as SelectModel;

    // provinciaSelect.value = '0' + provinciaSelect.value;

    return provinciaSelect;
  }

  private getDistritoSelect(): SelectModel | null {
    const codigoDistrito = localStorage.getItem('distrito') || null;
    if (codigoDistrito == null) return null;

    const distritoSelect = JSON.parse(codigoDistrito) as SelectModel;

    return distritoSelect;
  }

  getCodigoUsuario(): number {
    return codigoUsuario;
  }

  getCodigoPerfil(): number {
    return codigoPerfil;
  }

  registrarUsuario(usuario: UsuarioModel): Observable<ResponseModel | null> {

    this.#usuario.update((v) => ({ ...v, isLoading: true }));

    let ots: UsuarioRequestModel = {} as UsuarioRequestModel;

    if (usuario.perfil) ots.codigoPerfil = Number(usuario.perfil); //Number(usuario.perfil.value);
    if (usuario.tipo) ots.tipo = Number(usuario.tipo.value);
    if (usuario.sector) ots.sector = Number(usuario.sector.value);
    if (usuario.dep != null && usuario.dep != undefined) ots.codigoDepartamento = usuario.dep.value!.toString();
    if (usuario.prov != null && usuario.prov != undefined) ots.codigoProvincia = usuario.prov.value!.toString();
    if (usuario.entidad) ots.entidad = Number(usuario.entidad.value);
    if (usuario.clave) ots.contrasena = usuario.clave;
    if (usuario.correo) ots.correoNotificacion = usuario.correo;
    if (usuario.nombre) ots.nombresPersona = usuario.nombre;
    if (usuario.telefono) ots.telefono = usuario.telefono;
    ots.tipoDocumento = 1;
    if (usuario.dni) ots.numeroDocumento = usuario.dni;
    ots.esActivo = true;
    ots.nombreUsuario = '';

    return this.http.post<ResponseModel>(`${environment.api}/Usuario/RegistrarUsuario`, ots).pipe(
      tap((resp: ResponseModel) => {
        if (resp.success) {

          if (resp.data == 0) {
            this.msg.error(resp.message);
          } else {
            this.msg.success(resp.message);
          }
        } else {
          this.msg.error(resp.message);
        }

        this.#usuario.update((v) => ({ ...v, isLoading: false }));
      }),
      catchError((err) => {
        this.msg.error("Hubo un error al registrar el usuario", err);
        this.#usuario.update((v) => ({ ...v, isLoading: false }));
        return of(null);
      }),
    );
  }

  verificarDisponibilidadDni(numeroDocumento: string): Observable<ResponseModel | null> {
    this.#usuario.update((v) => ({ ...v, isLoading: true }));
    return this.http.post<ResponseModel>(`${environment.api}/Login/verificarDisponibilidad`, { numeroDocumento }).pipe(
      tap((resp: ResponseModel) => {
        if (!resp.success) {
          this.msg.error(resp.message, { nzDuration: 5000 });
        }
        this.#usuario.update((v) => ({ ...v, isLoading: false }));
      }),
      catchError((err) => {
        this.msg.error("Hubo un error al verificar la disponibilidad", err);
        this.#usuario.update((v) => ({ ...v, isLoading: false }));
        return of(null);
      })
    );
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

  logout(token: string): Observable<any> {
    return this.http.post(`${environment.api}/Login/CerrarSesion`, { token });
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

  puedeVerPedidos(): Observable<boolean> {
    const subTipo = this.getSubTipo();

    // this.#usuario.update((v) => ({ ...v, canViewPedidos: subTipo !== 'EJECUTORA' }));

    return of(subTipo !== 'EJECUTORA');
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

          if (resp.data.menus != null) {
            const navigation = resp.data.menus
            // this._navigationAuth.set(navigation)
          }
        })
      );
  }

  obtenerToken(): null | string {
    var token: Token = JSON.parse(localStorage.getItem('token')!);

    if (token == null) {
      return null;
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
    // localStorage.removeItem('nombreTrabajador');
    // localStorage.removeItem('token');
    // localStorage.removeItem('refresh');
    // localStorage.removeItem('perfil');
    // localStorage.removeItem('menus');
    // localStorage.removeItem('codigoUsuario');
    // localStorage.removeItem('codigoPerfil');
    // localStorage.removeItem('trabajador');
    // localStorage.removeItem('descripcionTipo');
    // localStorage.removeItem('descripcionSector');
    // localStorage.removeItem('permisos');
    // localStorage.removeItem('permisosPcm');
    // localStorage.removeItem('departamento');
    // localStorage.removeItem('provincia');
    // localStorage.removeItem('distrito');
    // localStorage.removeItem('nivel');
    // localStorage.removeItem('subTipo');
    // localStorage.removeItem('codigoSector');
    // localStorage.removeItem('sector');
    // localStorage.removeItem('acuerdosParams');
    // localStorage.removeItem('pedidosParams');
    // localStorage.removeItem('hitosParams');
    // localStorage.removeItem('codigoNivel');
    // localStorage.removeItem('codigoSubTipo');
    localStorage.clear();

    this.#usuario.set({
      usuario: null,
      nombreTrabajador: null,
      token: null,
      refreshToken: null,
      perfil: null,
      isLoading: false,
      isAuthenticated: false,
      subTipo: null,
      canViewPedidos: false,
      selectedTheme: localStorage['theme'] || 'system',
      entidad: null,
      departamento: null,
      provincia: null,
      distrito: null,
      sector: null,
      permisos: null,
      codigoPerfil: null,
      navigation: null
    });

    // window.location.reload();
  }
}
