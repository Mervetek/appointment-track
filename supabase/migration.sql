-- =============================================
-- PsikoTakip - Supabase Veritabanı Tabloları
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- Proje oluşturma: https://supabase.com/dashboard
-- =============================================

-- UUID desteği
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== CLIENTS TABLOSU =====================
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

-- ===================== SESSIONS TABLOSU =====================
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

-- ===================== İNDEXLER =====================
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);

-- ===================== ROW LEVEL SECURITY =====================
-- Şimdilik anon key ile tam erişim veriyoruz (tek kullanıcı)
-- İleride auth eklendiğinde bu politikalar güncellenir

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Herkese okuma/yazma izni (anon key ile)
CREATE POLICY "Allow all access to clients" ON clients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to sessions" ON sessions
  FOR ALL USING (true) WITH CHECK (true);
