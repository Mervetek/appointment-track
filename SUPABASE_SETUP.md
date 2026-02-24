# 🗄️ Supabase Veritabanı Kurulum Rehberi

Bu rehber, PsikoTakip uygulamasını Supabase veritabanına bağlamak için gereken adımları açıklar.

> **Not:** Supabase yapılandırılmadan uygulama **localStorage** ile çalışmaya devam eder. Veritabanı entegrasyonu isteğe bağlıdır.

---

## 1️⃣ Supabase Hesabı Oluşturma

1. [https://supabase.com](https://supabase.com) adresine gidin
2. **"Start your project"** butonuna tıklayın
3. GitHub hesabınızla giriş yapın (ücretsiz)
4. **"New Project"** butonuna tıklayın
5. Proje bilgilerini doldurun:
   - **Name:** `psikotakip` (veya istediğiniz bir isim)
   - **Database Password:** Güçlü bir şifre belirleyin
   - **Region:** `Central EU (Frankfurt)` (Türkiye'ye en yakın)
6. **"Create new project"** tıklayın ve projenin oluşmasını bekleyin (~2 dakika)

---

## 2️⃣ Veritabanı Tablolarını Oluşturma

1. Supabase Dashboard'da sol menüden **"SQL Editor"** sekmesine gidin
2. **"New Query"** tıklayın
3. `supabase/migration.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. **"Run"** butonuna tıklayın (veya Ctrl+Enter)
5. Başarı mesajı almalısınız ✅

---

## 3️⃣ API Anahtarlarını Alma

1. Sol menüden **"Settings"** (⚙️ dişli ikonu) > **"API"** sekmesine gidin
2. Şu iki değeri kopyalayın:
   - **Project URL** → `https://xxxxx.supabase.co` şeklinde
   - **anon / public key** → `eyJhbGciOiJIUzI1NiIs...` şeklinde uzun bir token

---

## 4️⃣ .env Dosyasını Düzenleme

Projenin kök dizinindeki `.env` dosyasını açın ve değerleri yapıştırın:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 5️⃣ Uygulamayı Yeniden Başlatma

```bash
npm run dev
```

İlk açılışta uygulama otomatik olarak:
- Veritabanında veri var mı kontrol eder
- Yoksa örnek danışan ve seans verilerini yükler
- Tüm CRUD işlemleri artık veritabanı üzerinden yapılır

---

## ✅ Doğrulama

- Supabase Dashboard > **"Table Editor"** sekmesinde `clients` ve `sessions` tablolarını görmelisiniz
- Uygulamada bir danışan ekleyin → Supabase'de anında görünmeli
- Tarayıcı konsolunda `⚠️ Supabase yapılandırılmamış` mesajı **artık görünmemeli**

---

## 🔄 Çalışma Modları

| Durum | Davranış |
|-------|----------|
| `.env` boş / varsayılan | localStorage modu (offline çalışır) |
| `.env` doğru ayarlı | Supabase modu (bulut veritabanı) |
| Supabase erişilemez | Hata loglanır, localStorage'a fallback |

---

## 💡 İpuçları

- Supabase ücretsiz plan: **500MB** veritabanı, **50K** aylık aktif kullanıcı
- Proje 1 hafta inaktif kalırsa **pause** olur, Dashboard'dan tekrar başlatabilirsiniz
- `.env` dosyası `.gitignore`'a eklenmiştir, anahtarlarınız güvende
