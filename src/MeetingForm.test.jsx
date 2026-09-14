import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import MeetingForm from './MeetingForm'
import { sendEvent } from './webhook'

jest.mock('./webhook', () => ({ sendEvent: jest.fn() }))

beforeEach(() => {
  jest.clearAllMocks()
})

test('shows validation errors when submitted empty', async () => {
  await render(<MeetingForm onOpenPrivacy={() => {}} />)

  await fireEvent.press(screen.getByTestId('meeting-submit'))

  expect(screen.getByText('Adını daxil et')).toBeTruthy()
  expect(screen.getByText('E-poçt ünvanını daxil et')).toBeTruthy()
  expect(screen.getByText('Mövzunu qeyd et')).toBeTruthy()
  expect(screen.getByText('Davam etmək üçün razılığını təsdiqlə')).toBeTruthy()
  expect(sendEvent).not.toHaveBeenCalled()
})

test('submits sanitized fields and shows a success message', async () => {
  sendEvent.mockResolvedValue()
  await render(<MeetingForm onOpenPrivacy={() => {}} />)

  await fireEvent.changeText(screen.getByTestId('meeting-name'), '  Aygün  ')
  await fireEvent.changeText(screen.getByTestId('meeting-email'), 'aygun@example.com')
  await fireEvent.changeText(screen.getByTestId('meeting-topic'), 'Layihə müzakirəsi')
  await fireEvent.press(screen.getByTestId('meeting-consent'))
  await fireEvent.press(screen.getByTestId('meeting-submit'))

  await waitFor(() => {
    expect(screen.getByText('Görüş tələbiniz göndərildi. Tezliklə əlaqə saxlayacağıq.')).toBeTruthy()
  })
  expect(sendEvent).toHaveBeenCalledWith('meeting_requested', {
    name: 'Aygün',
    email: 'aygun@example.com',
    topic: 'Layihə müzakirəsi',
  })
})

test('shows an error message when the webhook call fails', async () => {
  sendEvent.mockRejectedValue(new Error('network'))
  await render(<MeetingForm onOpenPrivacy={() => {}} />)

  await fireEvent.changeText(screen.getByTestId('meeting-name'), 'Aygün')
  await fireEvent.changeText(screen.getByTestId('meeting-email'), 'aygun@example.com')
  await fireEvent.changeText(screen.getByTestId('meeting-topic'), 'Layihə müzakirəsi')
  await fireEvent.press(screen.getByTestId('meeting-consent'))
  await fireEvent.press(screen.getByTestId('meeting-submit'))

  await waitFor(() => {
    expect(screen.getByText('Göndərilmədi, bir azdan yenidən cəhd et.')).toBeTruthy()
  })
})

test('calls onOpenPrivacy when the consent privacy link is pressed', async () => {
  const onOpenPrivacy = jest.fn()
  await render(<MeetingForm onOpenPrivacy={onOpenPrivacy} />)

  await fireEvent.press(screen.getByTestId('meeting-privacy-link'))

  expect(onOpenPrivacy).toHaveBeenCalledTimes(1)
})
