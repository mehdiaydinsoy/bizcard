# BizCard

## Layihə haqqında
BizCard — rəqəmsal vizit kartı yaratmaq üçün tətbiqdir. İstifadəçilərə öz əlaqə məlumatlarını, sosial linklərini və şəxsi/peşəkar brendini asanlıqla paylaşa biləcəkləri müasir, sürətli və mobil-dost bir vizit kartı təcrübəsi təqdim etmək məqsədi daşıyır.

- **Sektor** — texnologiya/tələbə
- **Hədəf kütlə** — potensial işəgötürənlər və şəbəkə qurmaq istədiyim peşəkarlar

## Stack

- **Runtime**: Expo (managed workflow), React Native
- **Test**: `npm test` (Jest, `jest-expo` preset + `@testing-library/react-native`)
- **İşə salmaq**: `npm start` → Expo Go tətbiqi ilə göstərilən QR kodu skan et
- **Webhook**: `.env`-də `EXPO_PUBLIC_WEBHOOK_URL`

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
- UI dəyişiklikləri edildikdə Expo Go ilə real cihazda test et (`npm start`).

## Növbəti addımlar (bu faylı yeniləmək üçün)
- [x] Frontend stack seçimi — Expo / React Native
- [ ] Verilənlər bazası və autentifikasiya yanaşması
- [ ] Store deploy (EAS Build / App Store / Play Store) qərarlaşdıqda əlavə et
- [ ] Layihə qovluq strukturu qərarlaşdıqdan sonra qısa xəritə əlavə et
