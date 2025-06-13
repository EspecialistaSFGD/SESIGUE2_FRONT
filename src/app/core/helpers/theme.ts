import { ColorEstados, ThemeProgressBar } from '@core/interfaces';

export const themeProgressBarPercente = (value: number): string => {
  const themes: ThemeProgressBar[] = [
    { percent: 50, theme: '#D6D4D3' },
    { percent: 75, theme: '#DAEDE9' },
    { percent: 99, theme: '#6EC6D8' },
    { percent: 100, theme: '#018D86' },
  ]
  const theme = themes.find(theme => theme.percent >= value)
  return theme!.theme ?? '#D6D4D3'
}


export const themeState = (state: string) => {
  let theme: ColorEstados = {
    color: 'bg-amber-200 border-amber-400 text-amber-600',
    icono: 'sync'
  }
  switch (state) {
    case 'cerrado':
      theme.color = 'bg-green-200 border-green-400 text-green-600',
      theme.icono = 'check-circle';
      break;
    case 'seguimiento':
      theme.color = 'bg-blue-200 border-blue-400 text-blue-600'
      theme.icono = 'like'
      break;
  }
  return theme
}