# BizCard: Vite/React'dan Expo (React Native)'a köçürülmə

Tarix: 2026-09-14
Branch: `mobile`

## Məqsəd

Hazırkı Vite + React (DOM) veb tətbiqini idarə olunan (managed) Expo layihəsinə
tam köçürmək, elə ki tətbiq Expo Go-da işləsin. Veb deploy (GitHub Pages/Vercel)
dayandırılır — layihə bundan sonra yalnız mobil (Expo Go / iOS / Android)
hədəflər üçündür.

## Hazırkı vəziyyət (referans)

- `src/App.jsx` — tək komponentli vizit kartı: əlaqə linkləri (email/LinkedIn/GitHub),
  bacarıq etiketləri, QR kod (`qrcode.react`), vCard yükləmə düyməsi
  (`downloadVCard`, brauzer Blob/`<a download>` ilə), "Kartı yadda saxla" düyməsi
  (`handleCardSave` → `sendEvent('card_saved', ...)`), görüş tələbi forması
  (`handleMeetingSubmit` → `sendEvent('meeting_requested', ...)`).
- `src/webhook.js` — `import.meta.env.VITE_WEBHOOK_URL`-ə `fetch` POST edir.
- `src/PrivacyPolicy.jsx` + `privacy.html` + `src/privacy-main.jsx` — ayrı
  statik səhifə olaraq deploy olunan məxfilik siyasəti.
- `src/App.css` — bütün stil, işıq/qaranlıq rejim `prefers-color-scheme` ilə.
- `.env` → `VITE_WEBHOOK_URL=https://webhook.site/79f77807-c176-47cb-8b69-62474ccf4eac`
- `package.json` (Vite scriptləri: dev/build/preview/deploy), `vite.config.js`,
  `index.html`, `.vercel/`, `gh-pages` asılılığı.

## Əhatə xaricində

- Kontaktlar icazəsi / `expo-contacts` / cihazın rehberinə əlavə etmə —
  **istifadəçi tərəfindən açıq şəkildə çıxarıldı**. vCard yaratma da daxil
  olmaqla heç bir yerli "rehberə əlavə et" funksionallığı olmayacaq.
- React Navigation və ya digər naviqasiya kitabxanası — tətbiq tək ekranlıdır,
  ekran keçidi lokal state ilə idarə olunur.
- Veb (react-native-web) dəstəyi, GitHub Pages/Vercel deploy-un davamı.
- TypeScript-ə keçid.

## Hədəf arxitektura

Managed Expo layihəsi (`npx create-expo-app`, blank JS template), kök
qovluqda, `mobile` branch-ında.

### Fayl strukturu dəyişiklikləri

**Silinir:**
- `vite.config.js`, `index.html`, `privacy.html`
- `src/main.jsx`, `src/privacy-main.jsx`, `src/App.css`
- `.vercel/` (istifadəçi təsdiqi ilə)
- `package.json`-dan: `vite`, `@vitejs/plugin-react`, `gh-pages`, `qrcode.react`
  asılılıqları və `dev`/`build`/`preview`/`predeploy`/`deploy` skriptləri

**Əlavə olunur:**
- `App.js` — Expo giriş nöqtəsi, `registerRootComponent`
- `babel.config.js` — `babel-preset-expo`
- `app.json` — Expo konfiqurasiyası (ad, slug, icon/splash — default Expo
  aktivləri, kontaktlarla bağlı heç bir icazə girişi **yoxdur**)
- `package.json` — Expo skriptləri (`start`, `android`, `ios`, `web` yox)

**Uyğunlaşdırılır (qalır, məzmunu dəyişir):**
- `src/App.jsx` — React Native komponentlərinə çevrilir (aşağıya bax)
- `src/webhook.js` — dəyişməz məntiq, yalnız env dəyişəni mənbəyi dəyişir
- `src/PrivacyPolicy.jsx` — RN `ScrollView`/`Text` əsaslı ekrana çevrilir
- `.env` — açar adı `EXPO_PUBLIC_WEBHOOK_URL` olur, **dəyər eyni qalır**
  (`https://webhook.site/79f77807-c176-47cb-8b69-62474ccf4eac`)

### Ekran keçidi

`App.js` daxilində `const [screen, setScreen] = useState('card')` —
`'card'` ↔ `'privacy'` arasında şərti render. Naviqasiya kitabxanası yoxdur.

### Komponent uyğunlaşdırması

| Veb | Mobil (Expo) |
|---|---|
| `qrcode.react` `QRCodeSVG` | `react-native-qrcode-svg` (`react-native-svg` üzərində) |
| Əl ilə SVG ikonlar (Email/LinkedIn/GitHub) | `@expo/vector-icons` Ionicons (`mail`, `logo-linkedin`, `logo-github`) |
| `<a href="mailto:...">`, LinkedIn/GitHub/məxfilik linkləri | `Linking.openURL(...)` (`react-native`) |
| `App.css` (CSS dəyişənləri, media query) | `StyleSheet.create`, rənglər `useColorScheme()`-ə görə iki obyektdə saxlanılır (işıq/qaranlıq paritet) |
| `downloadVCard()` + "Kontakta əlavə et" düyməsi | **silinir**, əvəzi yoxdur |
| "Kartı yadda saxla" → `sendEvent('card_saved', ...)` | **eyni qalır** — mobil versiyada da `fetch` ilə həmin webhook-a POST atır, status mesajları (uğur/xəta) saxlanılır |
| Görüş tələbi forması (`handleMeetingSubmit`) | `TextInput` + `Pressable`/checkbox əvəzi (`Switch` və ya toxunma ilə işarələnən kvadrat) ilə, eyni validasiya və `sanitizeInput` məntiqi, eyni `sendEvent('meeting_requested', ...)` |
| Statik `privacy.html` səhifəsi | `PrivacyPolicy` komponenti in-app ekran kimi, "← Vizit kartına qayıt" `setScreen('card')` çağırır |

### Webhook

`src/webhook.js` məntiqi toxunulmaz qalır (event adı, payload forması,
`fetch`/POST, xəta atma). Yeganə dəyişiklik:
`import.meta.env.VITE_WEBHOOK_URL` → `process.env.EXPO_PUBLIC_WEBHOOK_URL`.
URL dəyəri eyni saxlanılır.

## Test planı

- `npx expo start` ilə bundle-ın xətasız qurulduğunu təsdiqləmək.
- Statik yoxlama: bütün `Linking.openURL`, `sendEvent` çağırışlarının doğru
  parametrlərlə edildiyini kod səviyyəsində təsdiqləmək.
- Fiziki cihazda Expo Go ilə vizual/interaktiv test (linklər, QR skan, forma
  submit, "Kartı yadda saxla" webhook POST-u) — **istifadəçi tərəfindən**
  edilməlidir, addım-addım təlimat veriləcək.

## Açıq risklər / qeydlər

- `react-native-qrcode-svg` və `react-native-svg` versiyalarının Expo SDK ilə
  uyğunluğu `npx expo install` ilə həll olunacaq (əl ilə versiya seçilməyəcək).
- Checkbox emulyasiyası RN-də native checkbox komponenti olmadığı üçün sadə
  toxunma ilə işarələnən kvadrat (`Pressable` + şərti stil) kimi tətbiq olunacaq.
