# 🧠 PsikoTakip - Psikolog Randevu Takip Uygulaması

Psikologlar için danışan yönetimi, seans takibi, ödeme kontrolü ve raporlama uygulaması.

## ✨ Özellikler

- 📊 **Dashboard** - Genel istatistikler, günün seansları, yaklaşan randevular
- 👥 **Danışan Yönetimi** - Ekleme, düzenleme, silme, detaylı profil
- 📅 **Takvim** - Haftalık/aylık/günlük görünüm (FullCalendar)
- 💰 **Ödemeler** - Ödeme durumu takibi, filtreleme
- 📈 **Raporlar** - Gelir, seans, mood grafikleri (Recharts)
- ☁️ **Supabase** - Bulut veritabanı (PostgreSQL), localStorage fallback

## 🛠️ Teknolojiler

- **React 19** + **Vite 7**
- **Material UI (MUI) 7** - Arayüz bileşenleri
- **Supabase** - Bulut PostgreSQL veritabanı
- **FullCalendar 6** - Takvim görünümü
- **Recharts 3** - Grafikler
- **React Router 7** - Sayfa yönlendirme
- **Day.js** - Tarih işlemleri

---

## 🚀 Başka Bilgisayarda Kurulum

### Gereksinimler

- [Node.js](https://nodejs.org/) (v18 veya üzeri)
- Bir Supabase hesabı (ücretsiz) → [supabase.com](https://supabase.com)

### Adım 1: Projeyi Kopyala

```bash
git clone <repo-url>
cd appointment-track
```

### Adım 2: Bağımlılıkları Yükle

```bash
npm install
```

### Adım 3: Supabase Veritabanını Hazırla

1. [supabase.com/dashboard](https://supabase.com/dashboard) adresine git
2. Yeni proje oluştur (veya mevcut projeyi kullan)
3. Sol menüden **SQL Editor** seç
4. `supabase/migration.sql` dosyasının içeriğini yapıştır ve **Run** butonuna bas

### Adım 4: Ortam Değişkenlerini Ayarla

`.env.example` dosyasını `.env` olarak kopyala:

```bash
cp .env.example .env
```

Supabase Dashboard → **Settings** → **API** bölümünden bilgileri al:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Adım 5: Uygulamayı Başlat

```bash
npm run dev
```

Tarayıcıda [http://localhost:5173](http://localhost:5173) adresini aç. 🎉

İlk açılışta örnek veriler otomatik olarak yüklenir.

---

## 📦 Production Build

```bash
npm run build
npm run preview
```

`dist/` klasöründeki dosyalar herhangi bir statik hosting servisine (Vercel, Netlify, vb.) deploy edilebilir.

---

## 📁 Proje Yapısı

```
appointment-track/
├── public/                  # Statik dosyalar
├── supabase/
│   └── migration.sql        # Veritabanı tablo şeması
├── src/
│   ├── components/
│   │   └── Layout/          # Sidebar, navigasyon
│   ├── context/
│   │   └── AppContext.jsx    # Global state (Supabase + localStorage)
│   ├── data/
│   │   └── sampleData.js    # Örnek seed verileri
│   ├── lib/
│   │   └── supabase.js      # Supabase client, CRUD, mappers
│   ├── pages/
│   │   ├── Calendar/        # Takvim sayfası
│   │   ├── Clients/         # Danışan listesi ve detay
│   │   ├── Dashboard/       # Ana panel
│   │   ├── Payments/        # Ödemeler
│   │   └── Reports/         # Raporlar
│   ├── utils/
│   │   └── helpers.js       # Yardımcı fonksiyonlar
│   ├── theme.js             # MUI tema ayarları
│   ├── App.jsx              # Router yapısı
│   └── main.jsx             # Giriş noktası
├── .env.example             # Ortam değişkenleri şablonu
├── package.json
└── vite.config.js
```

---

## 💡 Notlar

- **Supabase olmadan da çalışır!** `.env` dosyası yoksa veya Supabase bilgileri girilmemişse, uygulama otomatik olarak **localStorage** modunda çalışır.
- Veriler tarayıcı kapansa bile kaybolmaz (Supabase modunda bulutta, localStorage modunda tarayıcıda saklanır).
- İlk açılışta örnek danışan ve seans verileri otomatik yüklenir.
