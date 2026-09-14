import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { sendEvent } from './webhook'

const CONTACT = {
  firstName: 'Mehdi',
  lastName: 'Qasimov',
  fullName: 'Mehdi Qasimov',
  title: 'Developer',
  email: 'mehdiqasimov482@gmail.com',
  linkedin: 'https://linkedin.com/in/mehdiqasimov',
  github: 'https://github.com/mehdiaydinsoy',
}

const SKILLS = ['Python', 'HTML/CSS', 'Verilənlər Bazası', 'Alqoritmlər']

const INITIALS = CONTACT.firstName[0] + CONTACT.lastName[0]

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.48 1 4.98 2.12 4.98 3.5zM.5 8.75h4V23h-4V8.75zM8.5 8.75h3.83v1.96h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.66 4.77 6.11V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.49V23h-4V8.75z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.12 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.7.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

function ContactLink({ icon, label, value, href }) {
  return (
    <a className="link" href={href}>
      {icon}
      {label}
      <span className="value">{value}</span>
    </a>
  )
}

function CardQRCode() {
  return (
    <div className="qr">
      {/* fgColor SVG atributu var()-u tanımır, ona görə hazır hex dəyəri verilir */}
      <QRCodeSVG value={window.location.href} size={120} fgColor="#1c2230" bgColor="transparent" />
    </div>
  )
}

function sanitizeInput(value) {
  // Webhook payloadı e-poçt/panel kimi HTML kontekstlərinə düşə bilər,
  // ona görə teq yarada biləcək simvolları kənarda kəsirik
  return value.replace(/[<>]/g, '').trim()
}

function downloadVCard() {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${CONTACT.lastName};${CONTACT.firstName};;;`,
    `FN:${CONTACT.fullName}`,
    `TITLE:${CONTACT.title}`,
    `EMAIL;TYPE=INTERNET:${CONTACT.email}`,
    'END:VCARD',
  ].join('\r\n')

  const blob = new Blob([vcard], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${CONTACT.firstName.toLowerCase()}-${CONTACT.lastName.toLowerCase()}.vcf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function App() {
  const [saveStatus, setSaveStatus] = useState('idle')
  const [meetingFields, setMeetingFields] = useState({ name: '', email: '', topic: '' })
  const [consentChecked, setConsentChecked] = useState(false)
  const [errors, setErrors] = useState({})
  const [meetingStatus, setMeetingStatus] = useState('idle')

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

  async function handleMeetingSubmit(e) {
    e.preventDefault()

    if (meetingStatus === 'sending') {
      return
    }

    const name = sanitizeInput(meetingFields.name)
    const email = sanitizeInput(meetingFields.email)
    const topic = sanitizeInput(meetingFields.topic)
    const nextErrors = {}

    if (!name) {
      nextErrors.name = 'Adını daxil et'
    }
    if (!email) {
      nextErrors.email = 'E-poçt ünvanını daxil et'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'E-poçt ünvanı düzgün görünmür'
    }
    if (!topic) {
      nextErrors.topic = 'Mövzunu qeyd et'
    }
    if (!consentChecked) {
      nextErrors.consent = 'Davam etmək üçün razılığını təsdiqlə'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setMeetingStatus('sending')
    try {
      await sendEvent('meeting_requested', { name, email, topic })
      setMeetingStatus('success')
      setMeetingFields({ name: '', email: '', topic: '' })
      setConsentChecked(false)
    } catch (err) {
      console.error('Görüş tələbi göndərilmədi:', err)
      setMeetingStatus('error')
    }
  }

  return (
    <div className="card">
      <div className="avatar">{INITIALS}</div>
      <h1>{CONTACT.fullName}</h1>
      <p className="title">{CONTACT.title}</p>

      <div className="links">
        <ContactLink
          icon={<EmailIcon />}
          label="E-poçt"
          value={CONTACT.email}
          href={`mailto:${CONTACT.email}`}
        />
        <ContactLink
          icon={<LinkedInIcon />}
          label="LinkedIn"
          value={CONTACT.linkedin.replace('https://', '')}
          href={CONTACT.linkedin}
        />
        <ContactLink
          icon={<GitHubIcon />}
          label="GitHub"
          value={CONTACT.github.replace('https://', '')}
          href={CONTACT.github}
        />
      </div>

      <div className="skills">
        <h2 className="skills-title">Bacarıqlar</h2>
        <div className="skill-tags">
          {SKILLS.map((skill) => (
            <span className="skill-tag" key={skill}>{skill}</span>
          ))}
        </div>
      </div>

      <button className="save-btn" onClick={downloadVCard}>
        Kontakta əlavə et
      </button>

      <CardQRCode />

      <button className="card-save-btn" onClick={handleCardSave} disabled={saveStatus === 'sending'}>
        Kartı yadda saxla
      </button>
      {saveStatus === 'success' && (
        <p className="status-message status-message--success">Kart yadda saxlanıldı.</p>
      )}
      {saveStatus === 'error' && (
        <p className="status-message status-message--error">Saxlanılmadı, bir azdan yenidən cəhd et.</p>
      )}

      <h2 className="skills-title">Toplantı tələb et</h2>
      <form className="meeting-form" onSubmit={handleMeetingSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="meeting-name">Ad</label>
          <input
            id="meeting-name"
            className="form-input"
            type="text"
            value={meetingFields.name}
            onChange={(e) => setMeetingFields({ ...meetingFields, name: e.target.value })}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="meeting-email">E-poçt</label>
          <input
            id="meeting-email"
            className="form-input"
            type="email"
            value={meetingFields.email}
            onChange={(e) => setMeetingFields({ ...meetingFields, email: e.target.value })}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="meeting-topic">Mövzu</label>
          <input
            id="meeting-topic"
            className="form-input"
            type="text"
            value={meetingFields.topic}
            onChange={(e) => setMeetingFields({ ...meetingFields, topic: e.target.value })}
          />
          {errors.topic && <p className="field-error">{errors.topic}</p>}
        </div>
        <div className="form-checkbox-field">
          <label className="form-checkbox-label" htmlFor="meeting-consent">
            <input
              id="meeting-consent"
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
            />
            Şəxsi məlumatlarımın bu tələbi cavablandırmaq üçün emal olunmasına razıyam.
          </label>
          {errors.consent && <p className="field-error">{errors.consent}</p>}
        </div>
        <button className="form-submit-btn" type="submit" disabled={meetingStatus === 'sending'}>
          Göndər
        </button>
        {meetingStatus === 'success' && (
          <p className="status-message status-message--success">Görüş tələbiniz göndərildi. Tezliklə əlaqə saxlayacağıq.</p>
        )}
        {meetingStatus === 'error' && (
          <p className="status-message status-message--error">Göndərilmədi, bir azdan yenidən cəhd et.</p>
        )}
      </form>

      <p className="note">
        Əlaqə linkləri <code>src/App.jsx</code> faylındakı <code>CONTACT</code> obyektindən
        oxunur — dəyişmək üçün orada redaktə et.
      </p>
    </div>
  )
}
