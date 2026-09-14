import useColorScheme from 'react-native/Libraries/Utilities/useColorScheme'
import { renderHook } from '@testing-library/react-native'
import { useTheme, lightColors, darkColors } from './theme'

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}))

test('returns light colors when the scheme is light', async () => {
  useColorScheme.mockReturnValue('light')
  const { result } = await renderHook(() => useTheme())
  expect(result.current).toEqual(lightColors)
})

test('returns dark colors when the scheme is dark', async () => {
  useColorScheme.mockReturnValue('dark')
  const { result } = await renderHook(() => useTheme())
  expect(result.current).toEqual(darkColors)
})

test('falls back to light colors when the scheme is unknown', async () => {
  useColorScheme.mockReturnValue(null)
  const { result } = await renderHook(() => useTheme())
  expect(result.current).toEqual(lightColors)
})
