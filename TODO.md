# PsikoTakip — TODO List

## 🔴 Yüksek Öncelik

### Freemium + 14 Gün Deneme Sistemi
- [ ] Supabase `users` tablosuna eklenecek alanlar:
  - `plan`: 'free' | 'premium' (default: 'premium' — 14 gün trial)
  - `trial_start`: timestamp (kayıt tarihi)
  - `trial_end`: timestamp (kayıt + 14 gün)
  - `subscription_end`: timestamp (premium abonelik bitiş)
- [ ] Plan kontrol hook'u (`usePlan`) — trial süresi, plan tipi, limit kontrolü
- [ ] Ücretsiz plan sınırlamaları:
  - Maksimum 5 danışan
  - Bildirimler kapalı
  - Dışa aktarma (Excel/PDF) kapalı
  - Seans notları kapalı
  - Dashboard sadece basit istatistikler
- [ ] Premium plan (tüm özellikler sınırsız)
- [ ] Trial bitiş uyarısı (3 gün kala + son gün)
- [ ] Plan yükseltme sayfası / dialog
- [ ] Fiyatlandırma: Aylık 79₺ / Yıllık 599₺

### Ödeme Sistemi
- [ ] Ödeme altyapısı seçimi (Iyzico / Stripe / Store in-app purchase)
- [ ] Abonelik yönetimi (başlatma, iptal, yenileme)
- [ ] Ödeme geçmişi sayfası

### Mağaza Yayını (Amazon Appstore — Ücretsiz)
- [ ] PWA ikonları (PNG formatında) ✅
- [ ] manifest.json güncelleme ✅
- [ ] assetlinks.json ✅
- [ ] TWA (Trusted Web Activity) ile APK oluştur (PWABuilder)
- [ ] Amazon Appstore bireysel geliştirici hesabı aç
- [ ] Store listesi hazırla (açıklama, ekran görüntüleri, kategori)
- [ ] APK yükle ve yayınla
- [ ] Samsung Galaxy Store'a da yayınla (ücretsiz)

### Web Push API — Arka Plan Bildirimleri
- [ ] Uygulama/tarayıcı kapalıyken de bildirim gelmesi için sunucu taraflı Web Push sistemi kur
- [ ] VAPID key pair oluştur (public + private)
- [ ] Client tarafında Push Subscription al ve Supabase'e kaydet
- [ ] Supabase'de `push_subscriptions` tablosu oluştur (user_id, endpoint, keys, created_at)
- [ ] Supabase Edge Function veya Vercel Cron ile her dakika çalışan kontrol fonksiyonu yaz
- [ ] 15dk kala `web-push` kütüphanesiyle bildirim gönder
- [ ] Subscription yenileme/silme mekanizması ekle

---

## 🟡 Orta Öncelik

### Premium Özellikler (Geliştirmesi gerekli)
- [ ] Seans notları alanı (sessions tablosuna `notes` kolonu)
- [ ] Excel dışa aktarma (danışan listesi, seans geçmişi)
- [ ] PDF rapor oluşturma (aylık özet)
- [ ] Detaylı dashboard grafikleri (gelir trendi, seans dağılımı)

### Diğer
- [ ] Şifre sıfırlama (e-posta ile)
- [ ] Kullanıcı profil sayfası
- [ ] Gizlilik politikası & Kullanım şartları sayfası (store için zorunlu)

## 🟢 Düşük Öncelik
- [ ] Chunk size optimizasyonu (dynamic import ile code-splitting)
- [ ] Apple App Store yayını (99$/yıl geliştirici hesabı gerekli)
- [ ] Google Play Store yayını (25$ tek seferlik)

---

## 💰 Gelir Modeli

### Freemium + 14 Gün Deneme
| Özellik | Ücretsiz | Premium |
|---------|----------|---------|
| Danışan sayısı | 5'e kadar | Sınırsız |
| Seans kaydı | ✅ | ✅ |
| Takvim | ✅ | ✅ |
| Seans türleri | ✅ | ✅ |
| Bildirimler | ❌ | ✅ |
| Seans notları | ❌ | ✅ |
| Excel/PDF dışa aktarma | ❌ | ✅ |
| Detaylı istatistikler | ❌ | ✅ |
| Çoklu cihaz senkronizasyonu | ✅ | ✅ |

### Fiyatlandırma
- Aylık: **79₺/ay**
- Yıllık: **599₺/yıl** (~50₺/ay, %37 tasarruf)
- 14 gün ücretsiz deneme (tüm özellikler açık)

---

## ✅ Tamamlanan
- [x] Generic login/registration sistemi (Supabase)
- [x] Kullanıcı bazlı veri izolasyonu (user_id)
- [x] Seans türleri: Online / Yüz yüze / HiWell
- [x] Takvim renk kodlaması (mavi/yeşil/mor)
- [x] Takvim legend (3 tür)
- [x] Light/Dark tema
- [x] i18n (TR/EN)
- [x] Tablet responsive tasarım
- [x] PWA desteği
- [x] Bildirim sistemi (uygulama açıkken — SW tabanlı)
- [x] Bildirim izin dialog'u
- [x] Test bildirimi butonu
- [x] Takvim zaman aralığı: 08:00 - 23:59
