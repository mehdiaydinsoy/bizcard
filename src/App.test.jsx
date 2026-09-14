import { render, screen, fireEvent } from '@testing-library/react-native'
import App from './App'
import { CONTACT } from './contact'

jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native')
  return function QRCode(props) {
    return <View testID="qr-code" {...props} />
  }
})

jest.mock('./webhook', () => ({ sendEvent: jest.fn().mockResolvedValue() }))

test('shows the card screen by default', async () => {
  await render(<App />)
  expect(screen.getByText(CONTACT.fullName)).toBeTruthy()
})

test('navigates to the privacy screen and back', async () => {
  await render(<App />)

  await fireEvent.press(screen.getByTestId('open-privacy-link'))
  expect(screen.getByText('Məxfilik Siyasəti')).toBeTruthy()
  expect(screen.queryByText(CONTACT.fullName)).toBeNull()

  await fireEvent.press(screen.getAllByTestId('privacy-back-link')[0])
  expect(screen.getByText(CONTACT.fullName)).toBeTruthy()
})
