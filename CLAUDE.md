# BizCard

## Layihə haqqında
BizCard — rəqəmsal vizit kartı yaratmaq üçün tətbiqdir. İstifadəçilərə öz əlaqə məlumatlarını, sosial linklərini və şəxsi/peşəkar brendini asanlıqla paylaşa biləcəkləri müasir, sürətli və mobil-dost bir vizit kartı təcrübəsi təqdim etmək məqsədi daşıyır.

Layihə hazırda erkən mərhələdədir — texnologiya seçimləri və struktur hələ formalaşır. Bu fayl layihə böyüdükcə yenilənməlidir (stack, qovluq strukturu, komandalar və s. məlum olduqca əlavə et).

- **Sektor** — texnologiya/tələbə
- **Hədəf kütlə** — potensial işəgötürənlər və şəbəkə qurmaq istədiyim peşəkarlar

## Ton və üslub
Bütün istifadəçiyə görünən mətnlər (UI mətnləri, xəta mesajları, onboarding, marketinq kopiyası) aşağıdakı tona uyğun olmalıdır:

- **Peşəkar amma isti** — dəqiq və etibarlı görünsün, amma quru və rəsmi olmasın. Robotik və ya həddindən artıq korporativ dil istifadə etmə.
- Sadə, aydın cümlələr qur. Lazımsız jargon işlətmə.
- İstifadəçiyə birbaşa müraciət et (sən/siz seçimini layihə auditoriyasına görə ardıcıl saxla).
- Xəta və boş vəziyyət (empty state) mesajlarında belə mehriban ol — istifadəçini günahlandırma, aydın növbəti addım göstər.
- Zarafat və emoji minimal saxlanılsın; "isti" olmaq həddindən artıq qeyri-rəsmi olmaq demək deyil.

## Kod və inkişaf prinsipləri
- Yeni asılılıq və ya abstraksiya əlavə etməzdən əvvəl həqiqətən lazım olduğuna əmin ol.
- Kod şərhləri minimal saxlanılsın — yalnız "niyə" aydın olmayanda şərh yaz.
- UI dəyişiklikləri edildikdə brauzerdə real olaraq test et (bu fayl yenilənəndə uyğun run/dev komandaları buraya əlavə olunmalıdır).

## Növbəti addımlar (bu faylı yeniləmək üçün)
- [ ] Frontend/backend stack seçimi (məs. React/Next.js, Vite, mobil framework və s.)
- [ ] Verilənlər bazası və autentifikasiya yanaşması
- [ ] Deploy/hosting platforması
- [ ] Layihə qovluq strukturu qərarlaşdıqdan sonra qısa xəritə əlavə et
