---
name: bizcard-conventions
description: Use when writing or editing any BizCard code — React komponenti, JSX/CSS faylı, rəng, şrift, class adı, yeni fayl yaratmaq, və ya n8n webhook/HTTP payload göndərmək. Covers component standards (colors, typography, file naming) and the required n8n webhook JSON envelope.
---

# BizCard Konvensiyaları

İki qayda: **(1)** komponent standartları, **(2)** n8n webhook formatı. Hər ikisi məcburidir.

Stack: React 18 + Vite, düz JSX (TypeScript yox), bir qlobal CSS faylı (`src/App.css`), CSS dəyişənləri ilə tema.

---

## 1. Komponent standartları

### 1.1 Rənglər — həmişə token, heç vaxt hardcode

Bütün rənglər `src/App.css` içindəki `:root` tokenlərindən gəlir. Komponentdə və ya yeni CSS-də hex yazma — `var(--token)` istifadə et.

| Token | Light | Dark | Nə üçün |
|---|---|---|---|
| `--bg-1` / `--bg-2` | `#eef1f6` / `#dfe6f0` | `#0f1420` / `#161d2e` | Səhifə fonu (radial-gradient) |
| `--card-bg` | `#F54927` | `#F54927` | Kart fonu |
| `--text-main` | `#1c2230` | `#f1f4fa` | Əsas mətn, başlıqlar |
| `--text-sub` | `#5b6472` | `#9aa5b8` | İkinci dərəcəli mətn, dəyərlər, qeydlər |
| `--accent` | `#3457d5` | `#7c93ff` | Düymələr, ikonlar, teqlər |
| `--accent-soft` | `#eef1ff` | `#232c44` | Link fonu, `code` fonu |
| `--border` | `#e7eaf0` | `#2a3348` | Kart çərçivəsi |
| `--shadow` | — | — | Kart kölgəsi |

Yeni rəng lazımdırsa: əvvəlcə `:root`-a token əlavə et, **sonra** `@media (prefers-color-scheme: dark)` bloku içində dark qarşılığını da ver. Dark bloku olmayan token qəbul edilmir.

Yeganə hardcode istisnası: rəngli fon üzərindəki `color: #fff` (avatar, `.skill-tag`, `.save-btn`) və `linear-gradient` içindəki `#8aa0ff`.

### 1.2 Tipoqrafiya

Şrift stack-i yalnız `body`-də təyin olunur, komponentdə `font-family` təkrarlama:
`"Segoe UI", "Inter", system-ui, -apple-system, sans-serif`

| Rol | Ölçü | Çəki | Nümunə |
|---|---|---|---|
| Ad / h1 | 22px | 700 | `.card h1` |
| Vəzifə | 15px | 500 | `.title` |
| Düymə | 15px | 600 | `.save-btn` |
| Link | 14.5px | 500 | `.link` |
| Link dəyəri, teq | 13px | 400–500 | `.link .value`, `.skill-tag` |
| Bölmə başlığı | 13px | 700, `uppercase`, `letter-spacing: 0.5px` | `.skills-title` |
| Qeyd | 11.5px | 400 | `.note` |

Ölçülər `px` ilə yazılır (layihədə `rem` istifadə olunmur). Yeni ölçü uydurma — yuxarıdakı pillələrdən birini seç.

### 1.3 Forma və məsafə

- Radiuslar: kart `24px`, link/düymə `14px`, pill/teq `999px`, avatar `50%`, `code` `6px`
- Bloklar arası boşluq: `margin-bottom: 22px`
- Flex `gap`: linklər `10px`, teqlər `8px`, ikon↔mətn `12px`
- Keçidlər: `transition: transform 0.15s ease, box-shadow 0.15s ease`

### 1.4 Fayl adlandırma

| Nə | Format | Nümunə |
|---|---|---|
| Komponent faylı | PascalCase + `.jsx` | `App.jsx`, `SkillTag.jsx` |
| Giriş nöqtəsi | lowercase | `main.jsx` |
| CSS | Komponentin adı ilə eyni | `App.css` |
| Köməkçi funksiyalar | camelCase + `.js` | `vcard.js`, `webhook.js` |

Hazırda hamısı birbaşa `src/` altındadır. Fayl ≈200 sətri keçənə qədər bölmə — `App.jsx` hələ bir faylda saxlanılır.

### 1.5 Komponent yazılışı

- `function ComponentName()` elan formatı — arrow function komponent yox
- Yalnız səhifə/kök komponenti `export default`; kiçik daxili komponentlər eyni faylda elan olunur
- Modul səviyyəsində sabitlər SCREAMING_SNAKE: `CONTACT`, `SKILLS`, `INITIALS`
- Nöqtəli vergül yoxdur, tək dırnaq, 2 boşluq girinti
- CSS class adları kebab-case və yastıdır: `.skill-tag`, `.save-btn`, `.skills-title` — BEM yox, iç-içə seçici yox
- İkonlar: `viewBox="0 0 24 24"` inline SVG komponent, rəng `currentColor` (CSS-dən idarə olunur), ölçü CSS-dən (`20px`). Kontur ikonlar `fill="none" stroke="currentColor" strokeWidth="2"`, brend loqoları `fill="currentColor"`
- İstifadəçiyə görünən bütün mətn Azərbaycan dilində və CLAUDE.md-dəki tona uyğun

---

## 2. n8n webhook formatı

**Hər webhook düz (flat) JSON obyekt göndərir və ilk iki sahə həmişə budur:**

```json
{
  "event": "contact.saved",
  "source": "bizcard",
  "timestamp": "2026-09-13T09:41:02.318Z",
  "cardId": "mehdi-qasimov"
}
```

### Məcburi sahələr

| Sahə | Tip | Qayda |
|---|---|---|
| `event` | string | `resurs.feil` — nöqtə ilə, feil keçmiş zamanda: `card.viewed`, `contact.saved`, `link.clicked` |
| `source` | string | **Həmişə tam olaraq `"bizcard"`** — dəyişən, env, və ya başqa dəyər yox |
| `timestamp` | string | `new Date().toISOString()` (UTC, ISO 8601) |

Hadisəyə aid qalan sahələr **eyni səviyyədə**, yastı şəkildə əlavə olunur (`data` və ya `payload` adlı iç obyekt yaratma). Sahə adları camelCase.

### Tək helper

Bütün webhook-lar `src/webhook.js` içindəki bir funksiyadan keçir — `fetch` çağırışını komponentin içində yazma.

```js
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL

export async function sendEvent(event, fields = {}) {
  if (!WEBHOOK_URL) return

  const payload = {
    event,
    source: 'bizcard',
    timestamp: new Date().toISOString(),
    ...fields,
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Analitika kartın işini dayandırmamalıdır
  }
}
```

İstifadə:

```js
sendEvent('contact.saved', { cardId: 'mehdi-qasimov' })
sendEvent('link.clicked', { label: 'LinkedIn', href: CONTACT.linkedin })
```

`sendEvent` heç vaxt `await` gözlədilmədən istifadəçi axınını bloklamamalıdır və xəta atmamalıdır — webhook düşəndə kart normal işləməlidir.

---

## Tez-tez edilən səhvlər

| Səhv | Düzgünü |
|---|---|
| Komponentdə `color: #3457d5` | `color: var(--accent)` |
| Yeni token yalnız `:root`-a əlavə etmək | Dark bloka da əlavə et |
| `font-size: 16px` kimi yeni pillə uydurmaq | Tipoqrafiya cədvəlindən seç |
| `.card__skill-tag` (BEM) | `.skill-tag` |
| `{ event, data: { ... } }` | Sahələr yastı, kök səviyyədə |
| `source: appName` və ya `"BizCard"` | Hərfi hərfinə `"bizcard"` |
| `Date.now()` timestamp | `new Date().toISOString()` |
| Komponentin içində birbaşa `fetch` | `sendEvent()` çağır |
