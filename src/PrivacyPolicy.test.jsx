import { render, screen, fireEvent } from '@testing-library/react-native'
import PrivacyPolicy from './PrivacyPolicy'

test('renders the policy title', async () => {
  await render(<PrivacyPolicy onBack={() => {}} />)
  expect(screen.getByText('Məxfilik Siyasəti')).toBeTruthy()
})

test('calls onBack when a back link is pressed', async () => {
  const onBack = jest.fn()
  await render(<PrivacyPolicy onBack={onBack} />)
  await fireEvent.press(screen.getAllByTestId('privacy-back-link')[0])
  expect(onBack).toHaveBeenCalledTimes(1)
})
