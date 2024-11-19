export const generateRangeNumber = (initNumber:number, limitNumber:number) => {
	return Array.from({ length: limitNumber - initNumber + 1 }, (_, i) => initNumber + i)
}