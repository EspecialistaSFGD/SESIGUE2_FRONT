export const getDateFormat = (date: Date, first: string = 'day'): string => {
	const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
	const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	return first == 'day' ? `${day}/${month}/${date.getFullYear()}` : `${month}/${day}/${date.getFullYear()}`
}

export const convertDateStringToDate = (date:string, separator:string = '/' ):Date => {
	const [day, month, year] = date.split(separator);
	return new Date(Number(year), Number(month) - 1, Number(day));
}

export const getBusinessDays = (fecha: Date, dias: number): Date => {
	let contador = 0;
		const nuevaFecha = new Date(fecha);

		while (contador < dias) {
			nuevaFecha.setDate(nuevaFecha.getDate() - 1);
			const diaSemana = nuevaFecha.getDay();
			if (diaSemana !== 0 && diaSemana !== 6) { // 0 = Domingo, 6 = Sábado
				contador++;
			}
		}

		return nuevaFecha;
}