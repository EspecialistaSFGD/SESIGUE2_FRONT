import { articleLabel } from "./articles"

export const typeErrorControl = (text: string, errors: any) => {
  let msg = ''
  const art = articleLabel(text)

  if (errors?.['required']) {
    msg = `${text} es requerido`
  } else if (errors?.['pattern']) {
    msg = `Debe tener formato valido`
  } else if (errors?.['min']) {
    msg = `El valor minimo es ${errors?.['min'].min}`
  } else if (errors?.['max']) {
    msg = `El valor maximo es ${errors?.['max'].max}`
  } else if (errors?.['minlength']) {
    msg = `${text} debe tener minimo ${errors?.['minlength'].requiredLength} caracteres`
  } else if (errors?.['maxlength']) {
    msg = `${text} debe tener maximo ${errors?.['maxlength'].requiredLength} caracteres`
  } else if (errors?.['msgBack']) {
    msg = errors?.['msgBack']
  } else if (errors?.['mailExist']) {
    msg = ` ${text} ya existe`
  } else if (errors?.['mailNoExist']) {
    msg = ` ${text} no existe`
  } else if (errors?.['notSame']) {
    msg = ` ${text} debe ser igual a la nueva contraseña`
  }
  return msg
}