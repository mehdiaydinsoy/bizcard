import { Linking } from 'react-native'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import CardScreen from './CardScreen'
import { sendEvent } from './webhook'
import { CONTACT } from './contact'

jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native')
  return function QRCode(props) {
    return <View testID="qr-code" {...props} />
  }
})

jest.mock('./webhook', () => ({ sendEvent: jest.fn() }))

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(Linking, 'openURL').mockResolvedValue()
})

test('renders the contact name and title', async () => {
  await render(<CardScreen onOpenPrivacy={() => {}} />)
  expect(screen.getByText(CONTACT.fullName)).toBeTruthy()
  expect(screen.getByText(CONTACT.title)).toBeTruthy()
})

test('opens the email link when the email row is pressed', async () => {
  await render(<CardScreen onOpenPrivacy={() => {}} />)
  await fireEvent.press(screen.getByTestId('contact-link-email'))
  expect(Linking.openURL).toHaveBeenCalledWith(`mailto:${CONTACT.email}`)
})

test('saves the card via the webhook and shows a success message', async () => {
  sendEvent.mockResolvedValue()
  await render(<CardScreen onOpenPrivacy={() => {}} />)

  await fireEvent.press(screen.getByTestId('card-save-button'))

  await waitFor(() => {
    expect(screen.getByText('Kart yadda saxlanıldı.')).toBeTruthy()
  })
  expect(sendEvent).toHaveBeenCalledWith('card_saved', { name: CONTACT.fullName })
})

test('shows an error message when the webhook call fails', async () => {
  sendEvent.mockRejectedValue(new Error('network'))
  await render(<CardScreen onOpenPrivacy={() => {}} />)

  await fireEvent.press(screen.getByTestId('card-save-button'))

  await waitFor(() => {
    expect(screen.getByText('Saxlanılmadı, bir azdan yenidən cəhd et.')).toBeTruthy()
  })
})

test('calls onOpenPrivacy when the footer privacy link is pressed', async () => {
  const onOpenPrivacy = jest.fn()
  await render(<CardScreen onOpenPrivacy={onOpenPrivacy} />)
  await fireEvent.press(screen.getByTestId('open-privacy-link'))
  expect(onOpenPrivacy).toHaveBeenCalledTimes(1)
})
