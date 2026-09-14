import { ScrollView, View, Text, Pressable, Linking, StyleSheet } from 'react-native'
import { useTheme } from './theme'

const CONTACT_EMAIL = 'mehdiqasimov482@gmail.com'
const RETENTION_PERIOD = '12 ay'
const LAST_UPDATED = '2026-09-14'

function PolicySection({ title, children, colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{title}</Text>
      {children}
    </View>
  )
}

function BackLink({ onBack, colors }) {
  return (
    <Pressable testID="privacy-back-link" onPress={onBack}>
      <Text style={[styles.link, { color: colors.accent }]}>← Vizit kartına qayıt</Text>
    </Pressable>
  )
}

export default function PrivacyPolicy({ onBack }) {
  const colors = useTheme()

  function openMail(subject) {
    const query = subject ? `?subject=${encodeURIComponent(subject)}` : ''
    Linking.openURL(`mailto:${CONTACT_EMAIL}${query}`)
  }

  return (
    <ScrollView contentContainerStyle={[styles.page, { backgroundColor: colors.cardBg }]}>
      <BackLink onBack={onBack} colors={colors} />

      <Text style={[styles.title, { color: colors.textMain }]}>Məxfilik Siyasəti</Text>
      <Text style={[styles.updated, { color: colors.textSub }]}>Son yenilənmə: {LAST_UPDATED}</Text>

      <Text style={[styles.paragraph, { color: colors.textSub }]}>
        Bu səhifə bu rəqəmsal vizit kartı vasitəsilə hansı şəxsi məlumatların toplandığını,
        nə üçün istifadə olunduğunu və hüquqlarını necə həyata keçirə biləcəyini izah edir.
        Məlumatların sahibi (nəzarətçi) Mehdi Qasimovdur, əlaqə:{' '}
        <Text style={{ color: colors.accent }} onPress={() => openMail()}>{CONTACT_EMAIL}</Text>.
      </Text>

      <PolicySection title="Topladığımız məlumatlar" colors={colors}>
        <Text style={[styles.paragraph, { color: colors.textSub }]}>
          Yalnız "Toplantı tələb et" formunu doldurduqda aşağıdakı məlumatlar toplanır:
        </Text>
        <Text style={[styles.listItem, { color: colors.textSub }]}>• Ad</Text>
        <Text style={[styles.listItem, { color: colors.textSub }]}>• E-poçt ünvanı</Text>
        <Text style={[styles.listItem, { color: colors.textSub }]}>• Mövzu (görüş üçün qeyd etdiyin qısa izah)</Text>
        <Text style={[styles.paragraph, { color: colors.textSub }]}>
          Formu doldurmadan kartı görmək, əlaqə linklərini açmaq və ya QR kodu skan etmək üçün heç bir şəxsi məlumat tələb olunmur.
        </Text>
      </PolicySection>

      <PolicySection title="Məlumatları hansı məqsədlə istifadə edirik" colors={colors}>
        <Text style={[styles.paragraph, { color: colors.textSub }]}>
          Bu məlumatlardan yalnız göndərdiyin toplantı tələbini görmək və sənə geri dönüş etmək üçün istifadə olunur. Başqa heç bir məqsədlə (marketinq, profil qurma və s.) işlədilmir.
        </Text>
      </PolicySection>

      <PolicySection title="Hüquqi əsas" colors={colors}>
        <Text style={[styles.paragraph, { color: colors.textSub }]}>
          Məlumatlar yalnız formu göndərərkən işarələdiyin açıq razılığın əsasında toplanır. Razılığı istənilən vaxt geri götürə bilərsən — bunun üçün aşağıdakı "Silmə tələbi" bölməsinə bax.
        </Text>
      </PolicySection>

      <PolicySection title="Saxlama müddəti" colors={colors}>
        <Text style={[styles.paragraph, { color: colors.textSub }]}>
          Toplantı tələbindəki məlumatlar tələb cavablandırıldıqdan sonra ən çoxu{' '}
          <Text style={{ fontWeight: '700' }}>{RETENTION_PERIOD}</Text> ərzində saxlanılır, bu müddətin sonunda silinir.
        </Text>
      </PolicySection>

      <PolicySection title="Üçüncü tərəflər" colors={colors}>
        <Text style={[styles.paragraph, { color: colors.textSub }]}>
          Məlumatların işlənməsi zamanı aşağıdakı xidmət təchizatçısından istifadə olunur:
        </Text>
        <Text style={[styles.listItem, { color: colors.textSub }]}>
          • n8n — formdan gələn məlumatı emal edən avtomatlaşdırma vasitəsi. Form göndərildikdə ad, e-poçt və mövzu bu xidmətə ötürülür ki, tələb sənə çatdırılsın.
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSub }]}>
          Məlumatlar heç bir üçüncü tərəfə satılmır və ya reklam məqsədilə paylaşılmır.
        </Text>
      </PolicySection>

      <PolicySection title="Hüquqların" colors={colors}>
        <Text style={[styles.listItem, { color: colors.textSub }]}>• Sənin haqqında hansı məlumatın saxlanıldığını öyrənmək</Text>
        <Text style={[styles.listItem, { color: colors.textSub }]}>• Yanlış məlumatın düzəldilməsini istəmək</Text>
        <Text style={[styles.listItem, { color: colors.textSub }]}>• Məlumatının silinməsini tələb etmək</Text>
        <Text style={[styles.listItem, { color: colors.textSub }]}>• Razılığını geri götürmək</Text>
      </PolicySection>

      <PolicySection title="Silmə tələbi necə edilir" colors={colors}>
        <Text style={[styles.paragraph, { color: colors.textSub }]}>
          Məlumatının silinməsini istəyirsənsə,{' '}
          <Text style={{ color: colors.accent }} onPress={() => openMail('Şəxsi məlumatların silinməsi tələbi')}>{CONTACT_EMAIL}</Text>{' '}
          ünvanına yaz. Tələbin ən qısa zamanda, gecikmədən nəzərdən keçirilir və məlumatın silindiyi barədə sənə geri dönüş edilir.
        </Text>
      </PolicySection>

      <BackLink onBack={onBack} colors={colors} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { padding: 24, paddingTop: 48, paddingBottom: 48 },
  link: { fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  updated: { fontSize: 13, marginBottom: 22 },
  paragraph: { fontSize: 14.5, lineHeight: 22, marginBottom: 8 },
  listItem: { fontSize: 14.5, lineHeight: 22, marginBottom: 4, marginLeft: 8 },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
})
