import { useColorScheme } from 'react-native'

export const lightColors = {
  bg: '#eef1f6',
  cardBg: '#ffffff',
  textMain: '#1c2230',
  textSub: '#5b6472',
  accent: '#3457d5',
  accentSoft: '#eef1ff',
  border: '#e7eaf0',
  error: '#d64545',
}

export const darkColors = {
  bg: '#0f1420',
  cardBg: '#1a2138',
  textMain: '#f1f4fa',
  textSub: '#9aa5b8',
  accent: '#7c93ff',
  accentSoft: '#232c44',
  border: '#2a3348',
  error: '#ff6b6b',
}

export function useTheme() {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkColors : lightColors
}
