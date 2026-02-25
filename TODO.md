# PsikoTakip — TODO List

## 🔴 Yüksek Öncelik

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
- [ ] (Eklenecek)

## 🟢 Düşük Öncelik
- [ ] Chunk size optimizasyonu (dynamic import ile code-splitting)

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
