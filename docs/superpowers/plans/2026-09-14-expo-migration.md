# BizCard Expo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate BizCard from a Vite/React (DOM) web app to a managed Expo (React Native) app that runs in Expo Go, keeping the webhook integration's URL and payload behavior unchanged and dropping web hosting entirely.

**Architecture:** A managed Expo app at the repo root. `App.js` re-exports `src/App.jsx`, which toggles between two screens (`CardScreen`, `PrivacyPolicy`) via local `useState` — no navigation library. Business logic (validation, webhook, theme colors) lives in small, independently testable pure-function modules under `src/`; UI components import them.

**Tech Stack:** Expo (managed workflow, blank JS template), React Native, `react-native-qrcode-svg` + `react-native-svg` (QR code), `@expo/vector-icons` (icons), `jest-expo` + `@testing-library/react-native` (tests).

**Spec:** `docs/superpowers/specs/2026-09-14-expo-migration-design.md`

## Global Constraints

- Webhook URL value stays **exactly** `https://webhook.site/79f77807-c176-47cb-8b69-62474ccf4eac` — only the env var mechanism changes (`VITE_WEBHOOK_URL` → `EXPO_PUBLIC_WEBHOOK_URL`). `src/webhook.js`'s payload shape (`event`, `source: 'bizcard'`, `timestamp`, `...fields`) and POST/error behavior do not change.
- No contacts permission, no `expo-contacts`, no native "add to contacts" action, and no vCard creation of any kind (including for the QR code) — explicitly excluded by the user and the approved spec.
- No React Navigation or any other navigation library — screen switching is local `useState` in `src/App.jsx`.
- No TypeScript.
- No `react-native-web`, no continued GitHub Pages/Vercel deploy — mobile (Expo Go / iOS / Android) only.
- Must run in Expo Go — only Expo SDK modules and JS-only packages, no custom native modules requiring a dev client.
- All user-facing text stays in Azerbaijani, in the existing warm-but-professional tone (per `CLAUDE.md`) — copy text moves as-is unless a code block below shows different wording.
- Light/dark colors must match `src/App.css`'s current values exactly (see Task 2).

---

### Task 1: Scaffold the Expo project and test harness

**Files:**
- Create: `app.json`, `assets/` (copied from a temporary scaffold)
- Create: `index.js`, `src/App.jsx` (placeholder), `src/App.test.jsx`
- Modify: `package.json` (rewritten for Expo), `.gitignore`, `.env`
- Delete: `vite.config.js`, `index.html`, `privacy.html`, `src/main.jsx`, `src/privacy-main.jsx`, `src/App.css`, `.vercel/`

**Interfaces:**
- Produces: `src/App.jsx` exports a default React component (placeholder for now, replaced in Task 9). Root `index.js` calls `registerRootComponent` on it. Jest is runnable via `npm test`.

> **Note (actual scaffold output may vary by SDK version):** the current Expo blank template (SDK 57) ships an `index.js` entry (`registerRootComponent(App)`) instead of an `App.js` re-export, and does **not** ship a `babel.config.js` at all — the preset is applied implicitly. `jest-expo`'s preset also doesn't need a project `babel.config.js` to transform JSX. Steps below reflect this; if your scaffold output differs, adapt file names accordingly and only add a `babel.config.js` (via `npx expo customize babel.config.js`) if `npm test` or `expo export` actually fails without one.
>
> **Note (breaking API in `@testing-library/react-native` v14):** `render()`, `renderHook()`, and every `fireEvent.*` call (`fireEvent.press`, `fireEvent.changeText`, etc.) are now `async` — every call must be `await`ed and every test that uses them must be an `async` test function. Skipping `await` on `fireEvent` doesn't throw, it just silently leaves the resulting state update unflushed, so the next synchronous assertion sees stale output (and Jest logs "overlapping act() calls" warnings that bleed into later tests in the same file). All test code below already reflects this.

- [ ] **Step 1: Scaffold a throwaway Expo project to source current versions and boilerplate**

```bash
SCAFFOLD_DIR=$(mktemp -d)
npx create-expo-app@latest "$SCAFFOLD_DIR/scaffold" --template blank --yes
cat "$SCAFFOLD_DIR/scaffold/package.json"
```

Expected: command completes without error; note the `expo`, `react`, and `react-native` version strings printed in `package.json` — they'll already be correct in the file you copy next, so no need to type them by hand.

- [ ] **Step 2: Copy the generated config/assets into the repo, then remove the scaffold**

Inspect what the scaffold actually generated first (`ls "$SCAFFOLD_DIR/scaffold"`) — copy `babel.config.js` too only if it exists.

```bash
cp "$SCAFFOLD_DIR/scaffold/package.json" ./package.json
cp "$SCAFFOLD_DIR/scaffold/app.json" ./app.json
cp -r "$SCAFFOLD_DIR/scaffold/assets" ./assets
rm -rf "$SCAFFOLD_DIR"
```

- [ ] **Step 3: Fix identity fields in `package.json` and `app.json`**

```bash
npm pkg set name=bizcard version=0.0.1 private=true
npm pkg delete scripts.web
```

Edit `app.json`: set `expo.name` and `expo.slug` to `"bizcard"`, and add `"userInterfaceStyle": "automatic"` at the `expo` level (so the OS-level chrome follows system light/dark mode, matching the app's own theme).

- [ ] **Step 4: Remove the old Vite files**

```bash
git rm -f vite.config.js index.html privacy.html src/main.jsx src/privacy-main.jsx src/App.css
git rm -rf .vercel
```

- [ ] **Step 5: Install base dependencies, then add QR/icon and test libraries**

```bash
npm install
npx expo install react-native-svg react-native-qrcode-svg
npm install --save-dev jest-expo @testing-library/react-native react-test-renderer
```

- [ ] **Step 6: Wire up Jest**

```bash
npm pkg set jest.preset=jest-expo
npm pkg set scripts.test=jest
```

- [ ] **Step 7: Update `.gitignore` and `.env`**

Edit `.gitignore` to:

```
node_modules
dist
.env
.expo
web-build
```

Edit `.env` — rename the key, keep the value identical:

```
EXPO_PUBLIC_WEBHOOK_URL=https://webhook.site/79f77807-c176-47cb-8b69-62474ccf4eac
```

- [ ] **Step 8: Write the failing placeholder test**

Create `src/App.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react-native'
import App from './App'

test('renders a BizCard placeholder', async () => {
  await render(<App />)
  expect(screen.getByText('BizCard')).toBeTruthy()
})
```

- [ ] **Step 9: Run the test and confirm it fails**

Run: `npm test -- src/App.test.jsx`
Expected: FAIL — `src/App.jsx` still contains the old DOM-based JSX (`<div>`, CSS class names), which isn't valid inside React Native's renderer.

- [ ] **Step 10: Replace `src/App.jsx` with a minimal RN placeholder and create the root entry file**

Overwrite `src/App.jsx`:

```jsx
import { Text, View, StyleSheet } from 'react-native'

export default function App() {
  return (
    <View style={styles.container}>
      <Text>BizCard</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
```

Create `index.js` at the repo root (matches the scaffold's `"main": "index.js"`):

```js
import { registerRootComponent } from 'expo'

import App from './src/App'

registerRootComponent(App)
```

- [ ] **Step 11: Run the test again and confirm it passes**

Run: `npm test -- src/App.test.jsx`
Expected: PASS

- [ ] **Step 12: Verify the whole toolchain bundles**

Run: `npx expo export --platform android`
Expected: completes without error (proves `babel.config.js`, `app.json`, and dependencies are wired correctly).

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "Expo scaffold: replace Vite setup with managed Expo project + Jest harness"
```

---

### Task 2: Theme module (light/dark colors)

**Files:**
- Create: `src/theme.js`, `src/theme.test.js`

**Interfaces:**
- Produces: `export const lightColors`, `export const darkColors` (both objects with keys `bg`, `cardBg`, `textMain`, `textSub`, `accent`, `accentSoft`, `border`, `error`); `export function useTheme()` returning one of those two objects based on `useColorScheme()`.
- Consumed by: `src/App.jsx`, `src/CardScreen.jsx`, `src/PrivacyPolicy.jsx`, `src/MeetingForm.jsx` (later tasks).

- [ ] **Step 1: Write the failing tests**

Create `src/theme.test.js`:

```js
import useColorScheme from 'react-native/Libraries/Utilities/useColorScheme'
import { renderHook } from '@testing-library/react-native'
import { useTheme, lightColors, darkColors } from './theme'

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}))

test('returns light colors when the scheme is light', async () => {
  useColorScheme.mockReturnValue('light')
  const { result } = await renderHook(() => useTheme())
  expect(result.current).toEqual(lightColors)
})

test('returns dark colors when the scheme is dark', async () => {
  useColorScheme.mockReturnValue('dark')
  const { result } = await renderHook(() => useTheme())
  expect(result.current).toEqual(darkColors)
})

test('falls back to light colors when the scheme is unknown', async () => {
  useColorScheme.mockReturnValue(null)
  const { result } = await renderHook(() => useTheme())
  expect(result.current).toEqual(lightColors)
})
```

> **Note:** mocking the whole `'react-native'` module (e.g. `{...jest.requireActual('react-native'), useColorScheme: jest.fn()}`) crashes — spreading forces eager evaluation of native-module getters that aren't available under Jest. Mock the specific leaf file `react-native/Libraries/Utilities/useColorScheme` instead, shaped as `{ __esModule: true, default: jest.fn() }` (react-native's own `index.js` reads `.default` off it directly).

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- src/theme.test.js`
Expected: FAIL with "Cannot find module './theme'"

- [ ] **Step 3: Implement `src/theme.js`**

```js
import { useColorScheme } from 'react-native'

export const lightColors = {
  bg: '#eef1f6',
  cardBg: '#ffffff',
  textMain: '#1c2230',
  textSub: '#5b6472',
  accent: '#3457d5',
  accentSoft: '#eef1ff',
  border: '#e7eaf0',
  error: '#d64545',
}

export const darkColors = {
  bg: '#0f1420',
  cardBg: '#1a2138',
  textMain: '#f1f4fa',
  textSub: '#9aa5b8',
  accent: '#7c93ff',
  accentSoft: '#232c44',
  border: '#2a3348',
  error: '#ff6b6b',
}

export function useTheme() {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkColors : lightColors
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- src/theme.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/theme.js src/theme.test.js
git commit -m "Add light/dark theme module"
```

---

### Task 3: Validation helpers

**Files:**
- Create: `src/validation.js`, `src/validation.test.js`

**Interfaces:**
- Produces: `export function sanitizeInput(value: string): string`, `export function isValidEmail(value: string): boolean`.
- Consumed by: `src/MeetingForm.jsx` (Task 7).

- [ ] **Step 1: Write the failing tests**

Create `src/validation.test.js`:

```js
import { sanitizeInput, isValidEmail } from './validation'

test('sanitizeInput trims and strips angle brackets', () => {
  expect(sanitizeInput('  <script>hi</script>  ')).toBe('scripthi/script')
})

test('sanitizeInput leaves normal text untouched', () => {
  expect(sanitizeInput('Mehdi Qasimov')).toBe('Mehdi Qasimov')
})

test('isValidEmail accepts a normal address', () => {
  expect(isValidEmail('someone@example.com')).toBe(true)
})

test('isValidEmail rejects a string without an @', () => {
  expect(isValidEmail('someone.example.com')).toBe(false)
})

test('isValidEmail rejects a string without a domain dot', () => {
  expect(isValidEmail('someone@example')).toBe(false)
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- src/validation.test.js`
Expected: FAIL with "Cannot find module './validation'"

- [ ] **Step 3: Implement `src/validation.js`**

```js
export function sanitizeInput(value) {
  return value.replace(/[<>]/g, '').trim()
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- src/validation.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/validation.js src/validation.test.js
git commit -m "Add sanitizeInput/isValidEmail validation helpers"
```

---

### Task 4: Webhook module (env var swap)

**Files:**
- Modify: `src/webhook.js`
- Create: `src/webhook.test.js`

**Interfaces:**
- Produces: `export async function sendEvent(event: string, fields?: object): Promise<void>` — throws `Error` when the response isn't ok; no-ops when `EXPO_PUBLIC_WEBHOOK_URL` is unset.
- Consumed by: `src/CardScreen.jsx` (Task 8), `src/MeetingForm.jsx` (Task 7).

- [ ] **Step 1: Write the failing tests**

Create `src/webhook.test.js`:

```js
const ORIGINAL_ENV = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_WEBHOOK_URL: 'https://example.com/hook' }
  global.fetch = jest.fn()
})

afterEach(() => {
  process.env = ORIGINAL_ENV
})

test('posts the event payload to the configured webhook URL', async () => {
  global.fetch.mockResolvedValue({ ok: true })
  const { sendEvent } = require('./webhook')

  await sendEvent('card_saved', { name: 'Mehdi Qasimov' })

  expect(global.fetch).toHaveBeenCalledWith(
    'https://example.com/hook',
    expect.objectContaining({ method: 'POST' })
  )
  const body = JSON.parse(global.fetch.mock.calls[0][1].body)
  expect(body).toEqual(
    expect.objectContaining({ event: 'card_saved', source: 'bizcard', name: 'Mehdi Qasimov' })
  )
})

test('throws when the webhook responds with a non-ok status', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 500 })
  const { sendEvent } = require('./webhook')

  await expect(sendEvent('card_saved')).rejects.toThrow('500')
})

test('does nothing when no webhook URL is configured', async () => {
  process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_WEBHOOK_URL: '' }
  jest.resetModules()
  const { sendEvent } = require('./webhook')

  await sendEvent('card_saved')

  expect(global.fetch).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- src/webhook.test.js`
Expected: FAIL — current `src/webhook.js` reads `import.meta.env.VITE_WEBHOOK_URL`, which is `undefined` under Jest/Node, so the "posts the event payload" test fails (fetch never called).

- [ ] **Step 3: Update `src/webhook.js`**

```js
const WEBHOOK_URL = process.env.EXPO_PUBLIC_WEBHOOK_URL

export async function sendEvent(event, fields = {}) {
  if (!WEBHOOK_URL) return

  const payload = {
    event,
    source: 'bizcard',
    timestamp: new Date().toISOString(),
    ...fields,
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Webhook sorğusu uğursuz oldu: ${res.status}`)
  }
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- src/webhook.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/webhook.js src/webhook.test.js
git commit -m "Switch webhook module to EXPO_PUBLIC_WEBHOOK_URL"
```

---

### Task 5: Contact data

**Files:**
- Create: `src/contact.js`

**Interfaces:**
- Produces: `export const CONTACT` (object: `firstName`, `lastName`, `fullName`, `title`, `email`, `linkedin`, `github`), `export const SKILLS` (string array).
- Consumed by: `src/CardScreen.jsx` (Task 8).

- [ ] **Step 1: Create the contact data module (no test — static data, not logic)**

Create `src/contact.js`:

```js
export const CONTACT = {
  firstName: 'Mehdi',
  lastName: 'Qasimov',
  fullName: 'Mehdi Qasimov',
  title: 'Developer',
  email: 'mehdiqasimov482@gmail.com',
  linkedin: 'https://linkedin.com/in/mehdiqasimov',
  github: 'https://github.com/mehdiaydinsoy',
}

export const SKILLS = ['Python', 'HTML/CSS', 'Verilənlər Bazası', 'Alqoritmlər']
```

- [ ] **Step 2: Commit**

```bash
git add src/contact.js
git commit -m "Add contact data module"
```

---

### Task 6: Privacy policy screen

**Files:**
- Modify: `src/PrivacyPolicy.jsx` (rewritten for React Native)
- Create: `src/PrivacyPolicy.test.jsx`

**Interfaces:**
- Consumes: `useTheme` from `./theme` (Task 2).
- Produces: default export `PrivacyPolicy({ onBack: () => void })` — a React component.
- Consumed by: `src/App.jsx` (Task 9).

- [ ] **Step 1: Write the failing tests**

Create `src/PrivacyPolicy.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- src/PrivacyPolicy.test.jsx`
Expected: FAIL — current `src/PrivacyPolicy.jsx` renders DOM elements (`<div>`, `<a>`), invalid under React Native's renderer.

- [ ] **Step 3: Rewrite `src/PrivacyPolicy.jsx`**

```jsx
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
```

Note: the "Üçüncü tərəflər" section drops the old Vercel bullet — the app no longer runs on Vercel, so only n8n (the form's data processor) remains accurate.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- src/PrivacyPolicy.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/PrivacyPolicy.jsx src/PrivacyPolicy.test.jsx
git commit -m "Rewrite privacy policy as a React Native screen"
```

---

### Task 7: Meeting request form

**Files:**
- Create: `src/MeetingForm.jsx`, `src/MeetingForm.test.jsx`

**Interfaces:**
- Consumes: `sanitizeInput`, `isValidEmail` from `./validation` (Task 3); `sendEvent` from `./webhook` (Task 4); `useTheme` from `./theme` (Task 2).
- Produces: default export `MeetingForm({ onOpenPrivacy: () => void })`.
- Consumed by: `src/CardScreen.jsx` (Task 8).

- [ ] **Step 1: Write the failing tests**

Create `src/MeetingForm.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- src/MeetingForm.test.jsx`
Expected: FAIL with "Cannot find module './MeetingForm'"

- [ ] **Step 3: Implement `src/MeetingForm.jsx`**

```jsx
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
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- src/MeetingForm.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/MeetingForm.jsx src/MeetingForm.test.jsx
git commit -m "Add meeting request form as a React Native component"
```

---

### Task 8: Card screen (links, skills, QR, save button)

**Files:**
- Create: `src/CardScreen.jsx`, `src/CardScreen.test.jsx`

**Interfaces:**
- Consumes: `useTheme` (Task 2), `CONTACT`/`SKILLS` (Task 5), `sendEvent` (Task 4), `MeetingForm` (Task 7).
- Produces: default export `CardScreen({ onOpenPrivacy: () => void })`.
- Consumed by: `src/App.jsx` (Task 9).

Note: the QR code encodes `CONTACT.linkedin` (a plain URL). The old web version encoded `window.location.href`, which has no equivalent now that there's no hosted web page — and per the Global Constraints, it must not encode vCard text either, since that would recreate the excluded "add to contacts" path through the back door.

- [ ] **Step 1: Write the failing tests**

Create `src/CardScreen.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- src/CardScreen.test.jsx`
Expected: FAIL with "Cannot find module './CardScreen'"

- [ ] **Step 3: Implement `src/CardScreen.jsx`**

```jsx
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
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- src/CardScreen.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/CardScreen.jsx src/CardScreen.test.jsx
git commit -m "Add card screen: links, skills, QR code, webhook save"
```

---

### Task 9: Wire up the root App (screen toggle) and drop the placeholder

**Files:**
- Modify: `src/App.jsx` (replace Task 1's placeholder), `src/App.test.jsx` (replace Task 1's placeholder test)

**Interfaces:**
- Consumes: `CardScreen` (Task 8), `PrivacyPolicy` (Task 6), `useTheme` (Task 2), `SafeAreaView` from `react-native-safe-area-context` (run `npx expo install react-native-safe-area-context` first — `react-native`'s own `SafeAreaView` is deprecated and warns at render time).
- Produces: default export `App()` — the full composed app, unchanged signature from Task 1 (root `index.js` needs no changes).

- [ ] **Step 1: Write the failing tests**

Overwrite `src/App.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- src/App.test.jsx`
Expected: FAIL — `src/App.jsx` is still the Task 1 placeholder (`Text: 'BizCard'`), it doesn't render `CONTACT.fullName` or a testID `open-privacy-link`.

- [ ] **Step 3: Rewrite `src/App.jsx`**

```jsx
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
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- src/App.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "Wire up card/privacy screen toggle in root App"
```

---

### Task 10: Full test suite, bundle check, and CLAUDE.md update

**Files:**
- Modify: `CLAUDE.md` (stack + run commands section)

**Interfaces:** none (integration/documentation task).

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all test files from Tasks 1–9 pass (no failures).

- [ ] **Step 2: Verify the full app bundles for both platforms**

```bash
npx expo export --platform android
npx expo export --platform ios
```

Expected: both complete without error.

- [ ] **Step 3: Update `CLAUDE.md`**

In the "Layihə haqqında" / "Növbəti addımlar" area, replace the unchecked stack item and add a run-commands note. Edit the "Növbəti addımlar (bu faylı yeniləmək üçün)" section to:

```markdown
## Stack

- **Runtime**: Expo (managed workflow), React Native
- **Test**: `npm test` (Jest, `jest-expo` preset + `@testing-library/react-native`)
- **İşə salmaq**: `npm start` → Expo Go tətbiqi ilə göstərilən QR kodu skan et
- **Webhook**: `.env`-də `EXPO_PUBLIC_WEBHOOK_URL`

## Növbəti addımlar (bu faylı yeniləmək üçün)
- [x] Frontend stack seçimi — Expo / React Native
- [ ] Verilənlər bazası və autentifikasiya yanaşması
- [ ] Store deploy (EAS Build / App Store / Play Store) qərarlaşdıqda əlavə et
- [ ] Layihə qovluq strukturu qərarlaşdıqdan sonra qısa xəritə əlavə et
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "Document Expo stack and run commands in CLAUDE.md"
```

- [ ] **Step 5: Manual Expo Go verification checklist (for the user — not automatable here)**

Report this checklist so the user can run it themselves:

1. `npm start`, scan the QR code with the Expo Go app on a phone.
2. Confirm the card renders: avatar initials, name, title, three contact links, skill tags, QR code, "Kartı yadda saxla" button, meeting form, footer privacy link.
3. Tap each contact link — email should open the mail app, LinkedIn/GitHub should open the browser.
4. Tap "Kartı yadda saxla" — confirm the success message appears and a new event shows up at the webhook.site inbox.
5. Submit the meeting form empty — confirm all four validation messages appear.
6. Submit the meeting form with valid data and the consent box checked — confirm the success message appears, the fields clear, and a `meeting_requested` event shows up at webhook.site.
7. Tap the footer "Məxfilik Siyasəti" link and the consent's inline link — both should open the in-app privacy screen; the back link should return to the card.
8. Scan the on-screen QR code with the phone's own camera app — confirm it opens the LinkedIn profile URL.
9. Toggle the phone's system light/dark mode — confirm the card's colors switch accordingly.
