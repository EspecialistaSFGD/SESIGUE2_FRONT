import { articleLabel } from "./articles"

export const typeErrorControl = (text: string, errors: any) => {
  let msg = ''
  const art = articleLabel(text)

  if (errors?.['required']) {
    msg = `${art} ${text} es requerido`
  } else if (errors?.['pattern']) {
    msg = `No tiene un formato de ${text}`
  } else if (errors?.['minlength']) {
    msg = `${art} ${text} debe tener minimo ${errors?.['minlength'].requiredLength} caracteres`
  } else if (errors?.['msgBack']) {
    msg = errors?.['msgBack']
  } else if (errors?.['mailExist']) {
    msg = `${art}  ${text} ya existe`
  } else if (errors?.['mailNoExist']) {
    msg = `${art}  ${text} no existe`
  } else if (errors?.['notSame']) {
    msg = `${art}  ${text} debe ser igual a la nueva contraseña`
  }
  return msg
}