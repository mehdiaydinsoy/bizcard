const CONTACT_EMAIL = 'mehdiqasimov482@gmail.com'
const RETENTION_PERIOD = '12 ay'
const LAST_UPDATED = '2026-09-14'

function PolicySection({ title, children }) {
  return (
    <section className="policy-section">
      <h2 className="policy-section-title">{title}</h2>
      {children}
    </section>
  )
}

export default function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <a className="privacy-link back-link" href="/">← Vizit kartına qayıt</a>

      <h1 className="policy-title">Məxfilik Siyasəti</h1>
      <p className="policy-updated">Son yenilənmə: {LAST_UPDATED}</p>

      <p className="policy-intro">
        Bu səhifə bu rəqəmsal vizit kartı vasitəsilə hansı şəxsi məlumatların toplandığını,
        nə üçün istifadə olunduğunu və hüquqlarını necə həyata keçirə biləcəyini izah edir.
        Məlumatların sahibi (nəzarətçi) Mehdi Qasimovdur, əlaqə: <a className="privacy-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <PolicySection title="Topladığımız məlumatlar">
        <p>Yalnız "Toplantı tələb et" formunu doldurduqda aşağıdakı məlumatlar toplanır:</p>
        <ul className="policy-list">
          <li>Ad</li>
          <li>E-poçt ünvanı</li>
          <li>Mövzu (görüş üçün qeyd etdiyin qısa izah)</li>
        </ul>
        <p>Formu doldurmadan kartı görmək, əlaqə linklərini açmaq və ya QR kodu skan etmək üçün heç bir şəxsi məlumat tələb olunmur.</p>
      </PolicySection>

      <PolicySection title="Məlumatları hansı məqsədlə istifadə edirik">
        <p>Bu məlumatlardan yalnız göndərdiyin toplantı tələbini görmək və sənə geri dönüş etmək üçün istifadə olunur. Başqa heç bir məqsədlə (marketinq, profil qurma və s.) işlədilmir.</p>
      </PolicySection>

      <PolicySection title="Hüquqi əsas">
        <p>Məlumatlar yalnız formu göndərərkən işarələdiyin açıq razılığın əsasında toplanır. Razılığı istənilən vaxt geri götürə bilərsən — bunun üçün aşağıdakı "Silmə tələbi" bölməsinə bax.</p>
      </PolicySection>

      <PolicySection title="Saxlama müddəti">
        <p>Toplantı tələbindəki məlumatlar tələb cavablandırıldıqdan sonra ən çoxu <strong>{RETENTION_PERIOD}</strong> ərzində saxlanılır, bu müddətin sonunda silinir.</p>
      </PolicySection>

      <PolicySection title="Üçüncü tərəflər">
        <p>Məlumatların işlənməsi zamanı aşağıdakı xidmət təchizatçılarından istifadə olunur:</p>
        <ul className="policy-list">
          <li><strong>Vercel</strong> — saytın hostinq və işə salınma xidməti. Sayta daxil olarkən texniki server məlumatları (məs. sorğu jurnalları) Vercel tərəfindən qısa müddət saxlanıla bilər.</li>
          <li><strong>n8n</strong> — formdan gələn məlumatı emal edən avtomatlaşdırma vasitəsi. Form göndərildikdə ad, e-poçt və mövzu bu xidmətə ötürülür ki, tələb sənə çatdırılsın.</li>
        </ul>
        <p>Məlumatlar heç bir üçüncü tərəfə satılmır və ya reklam məqsədilə paylaşılmır.</p>
      </PolicySection>

      <PolicySection title="Hüquqların">
        <p>İstənilən vaxt aşağıdakıları tələb edə bilərsən:</p>
        <ul className="policy-list">
          <li>Sənin haqqında hansı məlumatın saxlanıldığını öyrənmək</li>
          <li>Yanlış məlumatın düzəldilməsini istəmək</li>
          <li>Məlumatının silinməsini tələb etmək</li>
          <li>Razılığını geri götürmək</li>
        </ul>
      </PolicySection>

      <PolicySection title="Silmə tələbi necə edilir">
        <p>
          Məlumatının silinməsini istəyirsənsə, <a className="privacy-link" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Şəxsi məlumatların silinməsi tələbi')}`}>{CONTACT_EMAIL}</a> ünvanına yaz.
          Tələbin ən qısa zamanda, gecikmədən nəzərdən keçirilir və məlumatın silindiyi barədə sənə geri dönüş edilir.
        </p>
      </PolicySection>

      <a className="privacy-link back-link" href="/">← Vizit kartına qayıt</a>
    </div>
  )
}
