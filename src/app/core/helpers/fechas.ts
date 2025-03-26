export const dateZeroMonthDay = (date: Date): string => {
	const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
	const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	return `${date.getDate()}/${month}/${date.getFullYear()}`
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