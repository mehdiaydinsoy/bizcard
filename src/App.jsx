import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CardScreen from './CardScreen'
import PrivacyPolicy from './PrivacyPolicy'
import { useTheme } from './theme'

export default function App() {
  const [screen, setScreen] = useState('card')
  const colors = useTheme()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {screen === 'card' ? (
        <CardScreen onOpenPrivacy={() => setScreen('privacy')} />
      ) : (
        <PrivacyPolicy onBack={() => setScreen('card')} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
})
