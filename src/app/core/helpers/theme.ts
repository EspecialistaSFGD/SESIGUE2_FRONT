import { ThemeProgressBar } from '@core/interfaces';

export const themeProgressBarPercente = (value: number): string => {
  const themes: ThemeProgressBar[] = [
    { percent: 50, theme: '#D6D4D3' },
    { percent: 75, theme: '#DAEDE9' },
    { percent: 100, theme: '#6EC6D8' },
  ]
  const theme = themes.find(theme => theme.percent >= value)
  return theme!.theme ?? '#D6D4D3'
}