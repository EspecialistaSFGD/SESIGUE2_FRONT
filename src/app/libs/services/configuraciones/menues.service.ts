import { computed, inject, Injectable, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BaseHttpService } from '../../shared/base-http.service';
import { AuthService } from '../auth/auth.service';
import { MenuModel } from '../../models/shared/menu.model';
import { HttpParams } from '@angular/common/http';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';

interface State {
  menues: MenuModel[];
  menuSeleccionado: MenuModel;
  isLoading: boolean;
  isEditing: boolean;
  total: number;
  sortField: string | null;
  sortOrder: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MenuesService extends BaseHttpService {

  public authService = inject(AuthService);

  #menuResult = signal<State>({
    menues: [],
    menuSeleccionado: {} as MenuModel,
    isLoading: true,
    isEditing: false,
    total: 0,
    sortField: null,
    sortOrder: null,
  });

  public menues = computed(() => this.#menuResult().menues);
  public menuSeleccionado = computed(() => this.#menuResult().menuSeleccionado);
  public isLoading = computed(() => this.#menuResult().isLoading);
  public isEditing = computed(() => this.#menuResult().isEditing);
  public total = computed(() => this.#menuResult().total);

  listarMenues(codigoMenu: number | null = 0, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'codigoMenu', sortOrder: string | null = 'descend'): void {
    let params = new HttpParams();

    this.#menuResult.update((state) => ({
      ...state,
      isLoading: true,
    }));

    params = params.append('codigoMenu', `${codigoMenu}`);
    params = params.append('piCurrentPage', `${pageIndex}`);
    params = params.append('piPageSize', `${pageSize}`);
    params = params.append('columnSort', `${sortField}`);
    params = params.append('typeSort', `${sortOrder}`);

    this.http.get<ResponseModelPaginated>(`${this.apiUrl}/Menu/Listar`, { params }).subscribe({
      next: (data) => {
        this.#menuResult.update((state) => ({
          ...state,
          menues: data.data,
          total: data.info.total,
          isLoading: false,
        }));
      },
      error: (error) => {
        this.#menuResult.update((state) => ({
          ...state,
          isLoading: false,
        }));
        this.msg.error(error);
      },
    });
  }

  agregarMenu(menu: MenuModel): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.#menuResult.update((state) => ({ ...state, isEditing: true }));

      const ots: MenuModel = {} as MenuModel;

      if (menu.codigoMenu) ots.codigoMenu = menu.codigoMenu;
      if (menu.codigoMenuPadre) ots.codigoMenuPadre = menu.codigoMenuPadre;
      if (menu.direccionUrl) ots.direccionUrl = menu.direccionUrl;
      if (menu.descripcionItem) ots.descripcionItem = menu.descripcionItem;
      if (menu.iconoItem) ots.iconoItem = menu.iconoItem;
      if (menu.ordenItem) ots.ordenItem = Number(menu.ordenItem);
      ots.codigoUsuario = this.authService.getCodigoUsuario();

      this.http.post<ResponseModel>(`${this.apiUrl}/Menu/RegistrarMenu`, ots).subscribe({
        next: (data) => {
          this.msg.success(data.message);
          this.listarMenues();
          resolve(data);
        },
        error: (error) => {
          this.msg.error(error);
          reject(error);
        },
        complete: () => {
          this.#menuResult.update((state) => ({ ...state, isEditing: false }));
        }
      });
    });
  }

  eliminarMenu(codigoMenu: number): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.#menuResult.update((state) => ({ ...state, isLoading: true }));

      const ots: MenuModel = {} as MenuModel;

      ots.codigoMenu = codigoMenu;
      ots.codigoModifica = this.authService.getCodigoUsuario();

      this.http.post<ResponseModel>(`${this.apiUrl}/Menu/EliminarMenu}`, ots).subscribe({
        next: (data) => {
          this.msg.success(data.message);
          this.listarMenues();
          resolve(data);
        },
        error: (error) => {
          this.msg.error(error);
          reject(error);
        },
        complete: () => {
          this.#menuResult.update((state) => ({ ...state, isLoading: false }));
        }
      });
    });
  }

  seleccionarMenuById(codigoMenu: number | null | undefined): void {
    if (codigoMenu !== null && codigoMenu !== undefined) {
      const menu = this.#menuResult().menues.find((m) => m.codigoMenu === codigoMenu);
      this.#menuResult.update((state) => ({ ...state, menuSeleccionado: (menu) ? menu : {} as MenuModel }));
    } else {
      this.#menuResult.update((state) => ({ ...state, menuSeleccionado: {} as MenuModel }));
    }
  }
}
