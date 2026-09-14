import { render, screen } from '@testing-library/react-native'
import App from './App'

test('renders a BizCard placeholder', async () => {
  await render(<App />)
  expect(screen.getByText('BizCard')).toBeTruthy()
})
