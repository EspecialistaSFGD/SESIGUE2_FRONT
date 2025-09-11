export const generateRangeNumber = (initNumber:number, limitNumber:number) => {
	return Array.from({ length: limitNumber - initNumber + 1 }, (_, i) => initNumber + i)
}


export const generateBase64ToArrayBuffer = (base64: any) => {
	var binary_string = window.atob(base64);
	var len = binary_string.length;
	var bytes = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
  }

  export const generateMillesAndDecimal = (number: number, decimal: number = 0) => {
	return number.toFixed(decimal).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  export const capitalize = (text: string) => {
	if (!text) return '';
  	return text.charAt(0).toUpperCase() + text.slice(1);
	return 
  }