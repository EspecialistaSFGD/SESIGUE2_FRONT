export const articleLabel = ( label:string ):string => {
    const vowels = ['a','á','e','é','i','í','o','ó','u','ú']
  
    const word = label.trim().toLowerCase().split(' ')[0].split('')
  
    let last = word[ word.length - 1 ]
    const plural = last == 's' ? true : false
    let consonant = ''
    if( !vowels.includes( last ) ){
      consonant = last
      last = word[ word.length - 2 ]
    }
  
    let article = vowels.slice(0,2).includes( last ) ? 'La' : 'El'
    article = consonant == 'n' && last == vowels[7] ? 'La ' : article
    if( plural ){
      article = article == 'La' ? 'Las' : 'Los'
    }
  
    return article
  }