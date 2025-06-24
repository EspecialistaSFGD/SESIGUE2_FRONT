import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MesaDocumentoTipoEnum } from '@core/enums';
import { convertEnumToObject, obtenerPermisosBotones } from '@core/helpers';
import { ButtonsActions, ItemEnum, MesaResponse, UsuarioNavigation } from '@core/interfaces';
import { MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { DocumentosMesaComponent } from "./documentos-mesa/documentos-mesa.component";
import { IntegrantesMesaComponent } from "./integrantes-mesa/integrantes-mesa.component";
import { MesaDetalleComponent } from "./mesa-detalle/mesa-detalle.component";
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-mesa-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, IntegrantesMesaComponent, MesaDetalleComponent, DocumentosMesaComponent],
  templateUrl: './mesa-detalles.component.html',
  styles: ``
})
export default class MesaDetallesComponent {
  title: string = `Mesas`;

  mesasActions: ButtonsActions = {}
  permisosAgenda: boolean = false
  permisosIntegrantes: boolean = false
  permisosDocumentos: boolean = false
  permisosPCM: boolean = false
  perfilAuth: number = 0

  mesaId!: number
  tipos: ItemEnum[] = convertEnumToObject(MesaDocumentoTipoEnum)

  mesa = signal<MesaResponse>({
    nombre: '',
    abreviatura: '',
    sectorId: '',
    secretariaTecnicaId: '',
    fechaCreacion: '',
    fechaVigencia: '',
    resolucion: '',
    estadoRegistroNombre: '',
    estadoRegistro: '',
    usuarioId: ''
  })

  private mesaServices = inject(MesasService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private authStore = inject(AuthService)

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.setPermisosPCM()
    this.getPermissions()
    this.verificarMesa()
  }
  
  setPermisosPCM(){
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  getPermissions() {
    // const navigation  = this.authStore.navigationAuth()!
    const navigation:UsuarioNavigation[] = JSON.parse(localStorage.getItem('menus') || '')
    const menu = navigation.find((nav) => nav.descripcionItem.toLowerCase() == 'mesas')
    this.mesasActions = obtenerPermisosBotones(menu!.botones!)
    const navLevel =  menu!.children!

    this.permisosAgenda = navLevel.find(nav => nav.descripcionItem?.toLowerCase() == 'mesa agenda') ? true : false
    this.permisosIntegrantes = navLevel.find(nav => nav.descripcionItem?.toLowerCase() == 'mesa integrantes') ? true : false
    this.permisosDocumentos = navLevel.find(nav => nav.descripcionItem?.toLowerCase() == 'mesa documentos') ? true : false
  }

  verificarMesa(){
    const mesaId = this.route.snapshot.params['id'];
    const mesaIdNumber = Number(mesaId);
    if (isNaN(mesaIdNumber)) {
      this.router.navigate(['/mesas']);
      return;
    }

    this.mesaId = mesaIdNumber
    this.obtenerMesaService()
  }

  obtenerMesaService(){    
    this.mesaServices.obtenerMesa(this.mesaId.toString())
      .subscribe( resp => {
        if(resp.success){
          this.mesa.set(resp.data)
        } else {
          this.router.navigate(['/mesas']);
        }
      })
  }

  updateDetalle(actualizar: boolean){
    if(actualizar){
      this.obtenerMesaService()
    }
  }

}
