export const dateZeroMonthDay = (date: Date): string => {
	const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
	const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	return `${date.getDate()}/${month}/${date.getFullYear()}`
}