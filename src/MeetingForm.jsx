import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from './theme'
import { sanitizeInput, isValidEmail } from './validation'
import { sendEvent } from './webhook'

export default function MeetingForm({ onOpenPrivacy }) {
  const colors = useTheme()
  const [fields, setFields] = useState({ name: '', email: '', topic: '' })
  const [consentChecked, setConsentChecked] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  async function handleSubmit() {
    if (status === 'sending') return

    const name = sanitizeInput(fields.name)
    const email = sanitizeInput(fields.email)
    const topic = sanitizeInput(fields.topic)
    const nextErrors = {}

    if (!name) nextErrors.name = 'Adını daxil et'
    if (!email) nextErrors.email = 'E-poçt ünvanını daxil et'
    else if (!isValidEmail(email)) nextErrors.email = 'E-poçt ünvanı düzgün görünmür'
    if (!topic) nextErrors.topic = 'Mövzunu qeyd et'
    if (!consentChecked) nextErrors.consent = 'Davam etmək üçün razılığını təsdiqlə'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('sending')
    try {
      await sendEvent('meeting_requested', { name, email, topic })
      setStatus('success')
      setFields({ name: '', email: '', topic: '' })
      setConsentChecked(false)
    } catch (err) {
      console.error('Görüş tələbi göndərilmədi:', err)
      setStatus('error')
    }
  }

  return (
    <View style={styles.form}>
      <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Toplantı tələb et</Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSub }]}>Ad</Text>
        <TextInput
          testID="meeting-name"
          style={[styles.input, { backgroundColor: colors.accentSoft, borderColor: colors.border, color: colors.textMain }]}
          value={fields.name}
          onChangeText={(text) => setFields((f) => ({ ...f, name: text }))}
        />
        {errors.name && <Text style={[styles.fieldError, { color: colors.error }]}>{errors.name}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSub }]}>E-poçt</Text>
        <TextInput
          testID="meeting-email"
          style={[styles.input, { backgroundColor: colors.accentSoft, borderColor: colors.border, color: colors.textMain }]}
          value={fields.email}
          onChangeText={(text) => setFields((f) => ({ ...f, email: text }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={[styles.fieldError, { color: colors.error }]}>{errors.email}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSub }]}>Mövzu</Text>
        <TextInput
          testID="meeting-topic"
          style={[styles.input, { backgroundColor: colors.accentSoft, borderColor: colors.border, color: colors.textMain }]}
          value={fields.topic}
          onChangeText={(text) => setFields((f) => ({ ...f, topic: text }))}
        />
        {errors.topic && <Text style={[styles.fieldError, { color: colors.error }]}>{errors.topic}</Text>}
      </View>

      <Pressable testID="meeting-consent" style={styles.consentRow} onPress={() => setConsentChecked((c) => !c)}>
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.accent },
            consentChecked && { backgroundColor: colors.accent },
          ]}
        >
          {consentChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Text style={[styles.consentText, { color: colors.textSub }]}>
          Şəxsi məlumatlarımın bu tələbi cavablandırmaq üçün emal olunmasına razıyam.{' '}
          <Text testID="meeting-privacy-link" style={{ color: colors.accent }} onPress={onOpenPrivacy}>
            Məxfilik Siyasəti
          </Text>
        </Text>
      </Pressable>
      {errors.consent && <Text style={[styles.fieldError, { color: colors.error }]}>{errors.consent}</Text>}

      <Pressable
        testID="meeting-submit"
        style={[styles.submitBtn, { backgroundColor: colors.accent }, status === 'sending' && styles.disabled]}
        onPress={handleSubmit}
        disabled={status === 'sending'}
      >
        <Text style={styles.submitBtnText}>Göndər</Text>
      </Pressable>

      {status === 'success' && (
        <Text style={[styles.statusMessage, { color: colors.accent }]}>
          Görüş tələbiniz göndərildi. Tezliklə əlaqə saxlayacağıq.
        </Text>
      )}
      {status === 'error' && (
        <Text style={[styles.statusMessage, { color: colors.error }]}>Göndərilmədi, bir azdan yenidən cəhd et.</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  form: { width: '100%', marginTop: 22, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  input: { padding: 12, borderRadius: 14, borderWidth: 1, fontSize: 14.5 },
  fieldError: { fontSize: 12, margin: 0 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentText: { flex: 1, fontSize: 13, lineHeight: 18 },
  submitBtn: { width: '100%', padding: 13, borderRadius: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  statusMessage: { fontSize: 12.5, marginTop: 4, textAlign: 'center' },
})
