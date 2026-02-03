import { Params } from "@angular/router"
import { JneAutoridadTipoEnum, UbigeoTipoEnum } from "@core/enums"
import { EntidadResponse, ItemEnum, JneAutoridadParams, JneAutoridadResponse, UbigeoTipo } from "@core/interfaces"

export const convertEnumToObject = <E extends Record<string, string>>(enumType: E, replace: boolean = false): ItemEnum[] => {
  return Object.entries(enumType).map(([value, text]) => ({ value: replace ? value.replace(/_/g, ' ') : value, text: replace ? text.replace(/_/g, ' ') : text }))
}

export const findEnumToText = <E extends Record<string, string>>(enumType: E, key: string): ItemEnum => {
  const findEnum = convertEnumToObject(enumType)
	return findEnum.find( item => item.text == key.toString() )!
}

export const arrayDeleteDuplicates = (array: string[]):string[] => {
  return Array.from(new Set(array));
}

export const setParamsToObject = (params: Params, object: any, key: string) => {
    if(params[key]){
      object[key] = params[key]
    } else {
      delete object[key]
    }
    // return object
}

export const deleteKeysToObject = (object: any, keysDelete: string[]) => {
  const filteredPagination = Object.keys(object)
    .filter(key => !keysDelete.includes(key))
    .reduce((acc, key) => {
      acc[key] = object[key];
      return acc;
    }, {} as typeof object);

  return filteredPagination
}

export const deleteKeyNullToObject = (object: any) => {
  return Object.fromEntries(Object.entries(object).filter(([_, v]) => v !== null && v !== undefined && v !== ''));
}

export const obtenerAutoridadJnePorCargo = (autoridades: JneAutoridadResponse[]) =>{
  const cargosAutoridad = ['GOBERNADOR','ALCALDE']
  return autoridades.find(item => cargosAutoridad.includes(item.cargo.split(' ')[0]))!
}

export const obtenerUbigeoTipo = (ubigeo:string): UbigeoTipo => {
  const first = ubigeo.slice(0,2)
  const second = ubigeo.slice(2,4)
  const thirt = ubigeo.slice(4,6)

  let tipoUbigeo:UbigeoTipo = {
    departamento: first,
  }

  second == '00' ? delete tipoUbigeo.provincia : tipoUbigeo.provincia = `${first}${second}01`
  thirt == '00' ? delete tipoUbigeo.distrito : tipoUbigeo.distrito = ubigeo

  return tipoUbigeo
}

export const obtenerParamsAutoridadJne = (entidad: EntidadResponse): JneAutoridadParams => {
  const entidadTipo = entidad.entidadTipo!.toUpperCase()
  const tipoUbigeo = obtenerUbigeoTipo(entidad.ubigeo_jne!)

  let ubigeo = entidad.ubigeo_jne || entidad.ubigeo_oficial
  let tipo: JneAutoridadTipoEnum = JneAutoridadTipoEnum.REGION
  switch (entidadTipo) {
    case 'GR':
      tipo = JneAutoridadTipoEnum.REGION;
      ubigeo = `${tipoUbigeo.departamento}0000`;
    break;
    case 'MP':
      tipo = JneAutoridadTipoEnum.PROVINCIA;
      ubigeo = `${tipoUbigeo.provincia?.substring(0, 4)}00`;
    break;
    case 'MD':
      tipo = JneAutoridadTipoEnum.DISTRITO;
      ubigeo = tipoUbigeo.distrito!;
    break;
  }

  return { tipo, ubigeo }
}