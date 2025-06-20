import { Params } from "@angular/router"
import { ItemEnum } from "@core/interfaces"

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