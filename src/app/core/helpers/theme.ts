import { ColorEstados, ThemeProgressBar } from '@core/interfaces';

export const themeProgressBarPercente = (value: number): string => {
  const themes: ThemeProgressBar[] = [
    { percent: 50, theme: '#D6D4D3' },
    { percent: 75, theme: '#DAEDE9' },
    { percent: 99, theme: '#6EC6D8' },
    { percent: 100, theme: '#018D86' },
  ]
  const theme = themes.find(theme => theme.percent >= value)
  return theme ? theme!.theme : '#D6D4D3'
}


export const themeState = (state: string) => {
  let theme: ColorEstados = {
    color: 'bg-gray-100 border-gray-400 text-gray-600',
    icono: 'clock'
  }
  switch (state) {
    case 'culminado':
      theme.color = 'bg-green-100 border-green-400 text-green-600',
      theme.icono = 'check-circle';
      break;
    case 'cerrado':
      theme.color = 'bg-green-100 border-green-400 text-green-600',
      theme.icono = 'times';
      break;
    case 'proceso':
    case 'en proceso':
      theme.color = 'bg-sky-100 border-sky-400 text-sky-600',
      theme.icono = 'cog';
      break;
    case 'seguimiento':
      theme.color = 'bg-blue-100 border-blue-400 text-blue-600'
      theme.icono = 'thumbs-up'
      break;
    case 'iniciado':
      theme.color = 'bg-amber-100 border-amber-400 text-amber-600'
      theme.icono = 'exclamation-circle'
      break;
  }
  return theme
}