import { useState } from 'react'
import { ScrollView, View, Text, Pressable, Linking, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'
import { useTheme } from './theme'
import { CONTACT, SKILLS } from './contact'
import { sendEvent } from './webhook'
import MeetingForm from './MeetingForm'

const INITIALS = CONTACT.firstName[0] + CONTACT.lastName[0]

const LINKS = [
  { id: 'email', icon: 'mail-outline', label: 'E-poçt', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  {
    id: 'linkedin',
    icon: 'logo-linkedin',
    label: 'LinkedIn',
    value: CONTACT.linkedin.replace('https://', ''),
    href: CONTACT.linkedin,
  },
  {
    id: 'github',
    icon: 'logo-github',
    label: 'GitHub',
    value: CONTACT.github.replace('https://', ''),
    href: CONTACT.github,
  },
]

function ContactLink({ id, icon, label, value, href, colors }) {
  return (
    <Pressable
      testID={`contact-link-${id}`}
      style={[styles.link, { backgroundColor: colors.accentSoft }]}
      onPress={() => Linking.openURL(href)}
    >
      <Ionicons name={icon} size={20} color={colors.accent} />
      <Text style={[styles.linkLabel, { color: colors.textMain }]}>{label}</Text>
      <Text style={[styles.linkValue, { color: colors.textSub }]} numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  )
}

export default function CardScreen({ onOpenPrivacy }) {
  const colors = useTheme()
  const [saveStatus, setSaveStatus] = useState('idle')

  async function handleCardSave() {
    setSaveStatus('sending')
    try {
      await sendEvent('card_saved', { name: CONTACT.fullName })
      setSaveStatus('success')
    } catch (err) {
      console.error('Kart saxlanmadı:', err)
      setSaveStatus('error')
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: colors.bg }]}>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>{INITIALS}</Text>
        </View>
        <Text style={[styles.name, { color: colors.textMain }]}>{CONTACT.fullName}</Text>
        <Text style={[styles.title, { color: colors.textSub }]}>{CONTACT.title}</Text>

        <View style={styles.links}>
          {LINKS.map((link) => (
            <ContactLink key={link.id} {...link} colors={colors} />
          ))}
        </View>

        <View style={styles.skills}>
          <Text style={[styles.skillsTitle, { color: colors.textMain }]}>Bacarıqlar</Text>
          <View style={styles.skillTags}>
            {SKILLS.map((skill) => (
              <View key={skill} style={[styles.skillTag, { backgroundColor: colors.accent }]}>
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          testID="card-save-button"
          style={[styles.saveBtn, { backgroundColor: colors.accent }, saveStatus === 'sending' && styles.disabled]}
          onPress={handleCardSave}
          disabled={saveStatus === 'sending'}
        >
          <Text style={styles.saveBtnText}>Kartı yadda saxla</Text>
        </Pressable>
        {saveStatus === 'success' && (
          <Text style={[styles.statusMessage, { color: colors.accent }]}>Kart yadda saxlanıldı.</Text>
        )}
        {saveStatus === 'error' && (
          <Text style={[styles.statusMessage, { color: colors.error }]}>Saxlanılmadı, bir azdan yenidən cəhd et.</Text>
        )}

        <View style={styles.qr}>
          <QRCode value={CONTACT.linkedin} size={120} color={colors.textMain} backgroundColor="transparent" />
        </View>

        <MeetingForm onOpenPrivacy={onOpenPrivacy} />

        <Pressable testID="open-privacy-link" onPress={onOpenPrivacy}>
          <Text style={[styles.footerLink, { color: colors.accent }]}>Məxfilik Siyasəti</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '500', marginBottom: 22 },
  links: { width: '100%', gap: 10, marginBottom: 22 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
  linkLabel: { fontSize: 14.5, fontWeight: '500' },
  linkValue: { fontSize: 13, marginLeft: 'auto', flexShrink: 1 },
  skills: { width: '100%', marginBottom: 22 },
  skillsTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  skillTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillTag: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999 },
  skillTagText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  saveBtn: { width: '100%', padding: 13, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  statusMessage: { fontSize: 12.5, marginTop: 8, textAlign: 'center' },
  qr: { marginTop: 22, alignItems: 'center' },
  footerLink: { marginTop: 16, fontSize: 12, fontWeight: '500' },
})
