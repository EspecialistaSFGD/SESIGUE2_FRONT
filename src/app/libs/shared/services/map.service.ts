import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http.service';
import { Observable } from 'rxjs';
import { GeoAcuerdoModel } from '../../models/shared/geo-acuerdo.model';

@Injectable({
  providedIn: 'root'
})
export class MapService extends BaseHttpService {

  constructor() {
    super();
  }

  getDepartamentos(): Observable<any> {
    return this.http.get('assets/data/json/departamentos.json');
  }

  getGeoAcuerdos(): Observable<GeoAcuerdoModel[]> {
    return this.http.get<GeoAcuerdoModel[]>(`${this.topoJsonUrl}/geoacuerdos.topo.min.json`);
  }
}
