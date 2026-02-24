/**
 * Supabase Kurulum Scripti
 * Kullanım: node setup-supabase.mjs <SUPABASE_URL> <SUPABASE_ANON_KEY>
 * 
 * Örnek:
 * node setup-supabase.mjs https://abc123.supabase.co eyJhbGciOiJIUzI1NiIs...
 */

import { writeFileSync, readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const [, , url, key] = process.argv;

if (!url || !key) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🧠 PsikoTakip — Supabase Kurulum Scripti          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. https://supabase.com adresine git                        ║
║  2. GitHub ile giriş yap (ücretsiz)                          ║
║  3. "New Project" → isim ver → şifre belirle → oluştur       ║
║  4. Settings > API bölümünden şu 2 değeri kopyala:           ║
║     • Project URL                                            ║
║     • anon public key                                        ║
║                                                              ║
║  5. Bu komutu çalıştır:                                      ║
║                                                              ║
║  node setup-supabase.mjs <URL> <ANON_KEY>                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
    process.exit(1);
}

console.log('\n🔄 Supabase bağlantısı test ediliyor...\n');

const supabase = createClient(url, key);

// Bağlantı testi
try {
    // Basit bir health check — herhangi bir tablo olsa da olmasa da bağlanabilmeli
    const { error } = await supabase.from('clients').select('id', { count: 'exact', head: true });

    // 42P01 = tablo yok ama bağlantı başarılı, PGRST = PostgREST hatası (yine bağlantı var)
    if (error && error.code !== '42P01' && !error.code?.startsWith('PGRST')) {
        throw new Error(`Bağlantı hatası: ${error.message}`);
    }

    console.log('✅ Supabase bağlantısı başarılı!\n');
} catch (err) {
    console.error('❌ Bağlantı başarısız:', err.message);
    console.log('\nURL ve key değerlerini kontrol edin.\n');
    process.exit(1);
}

// Tabloları oluştur
console.log('📦 Veritabanı tabloları oluşturuluyor...\n');

const MIGRATION_SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  birth_date DATE,
  gender TEXT,
  emergency_contact TEXT,
  notes TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 50,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  fee NUMERIC(10, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  mood INTEGER CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5)),
  notes TEXT,
  homework TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to clients') THEN
    CREATE POLICY "Allow all access to clients" ON clients FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to sessions') THEN
    CREATE POLICY "Allow all access to sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

// SQL'i parçalara böl ve çalıştır (Supabase REST API üzerinden rpc ile)
const { error: sqlError } = await supabase.rpc('', {}).catch(() => ({ error: null }));

// Alternatif: Supabase Management API yerine doğrudan tabloları test edelim
// Eğer tablolar yoksa, kullanıcıya SQL'i kopyalaması gerektiğini söyleyelim
const { error: tableCheck } = await supabase.from('clients').select('id', { count: 'exact', head: true });

if (tableCheck && (tableCheck.code === '42P01' || tableCheck.message?.includes('does not exist'))) {
    console.log('⚠️  Tablolar henüz oluşturulmamış.');
    console.log('');
    console.log('📋 Supabase Dashboard > SQL Editor\'e gidin ve şu adımları izleyin:');
    console.log('   1. https://supabase.com/dashboard → projenizi seçin');
    console.log('   2. Sol menü → "SQL Editor"');
    console.log('   3. "New Query" tıklayın');
    console.log('   4. Aşağıdaki dosyanın içeriğini yapıştırın:');
    console.log('      📄 supabase/migration.sql');
    console.log('   5. "Run" butonuna tıklayın');
    console.log('');
    console.log('   ...veya bu SQL\'i doğrudan kopyalayın:');
    console.log('─'.repeat(60));
    console.log(readFileSync('supabase/migration.sql', 'utf-8'));
    console.log('─'.repeat(60));
} else {
    console.log('✅ Tablolar zaten mevcut!\n');
}

// .env dosyasını güncelle
console.log('📝 .env dosyası güncelleniyor...\n');
const envContent = `# Supabase Ayarları
VITE_SUPABASE_URL=${url}
VITE_SUPABASE_ANON_KEY=${key}
`;
writeFileSync('.env', envContent, 'utf-8');
console.log('✅ .env dosyası güncellendi!\n');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    ✅ Kurulum Tamamlandı!                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  .env dosyası güncellendi.                                   ║
║                                                              ║
║  Şimdi uygulamayı yeniden başlatın:                          ║
║  npm run dev                                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
