import { ItemEnum } from "@core/interfaces"

export const convertEnumToObject = <E extends Record<string, string>>(enumType: E): ItemEnum[] => {
  return Object.entries(enumType).map(([value, text]) => ({ value, text }))
}

export const findEnumToText = <E extends Record<string, string>>(enumType: E, key: string): ItemEnum => {
  const findEnum = convertEnumToObject(enumType)
	return findEnum.find( item => item.text == key.toString() )!
}