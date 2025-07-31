export const getSizeImage = ( size = 0 ) => {
  const getSize = ( size / 1024 ).toFixed(2)
  return Number(getSize) <= 1024 ? `${getSize} KB` : `${ ( Number(getSize) / 1024 ).toFixed(2) } MB`
}

export const getNameImage = ( name = '' ) => {
  const resizeName = name.length > 17 ? `...${name.slice(-14)}` : name
  return resizeName
}