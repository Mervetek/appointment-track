import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase yapılandırılmış mı kontrol et
export const isSupabaseConfigured = () => {
    return (
        supabaseUrl &&
        supabaseAnonKey &&
        supabaseUrl !== 'your_supabase_url_here' &&
        supabaseAnonKey !== 'your_supabase_anon_key_here'
    );
};

// Supabase client (yapılandırılmamışsa null)
export const supabase = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ===================== CLIENTS =====================

export const fetchClients = async (userId) => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapClientFromDb);
};

export const insertClient = async (client, userId) => {
    const { data, error } = await supabase
        .from('clients')
        .insert({ ...mapClientToDb(client), user_id: userId })
        .select()
        .single();
    if (error) throw error;
    return mapClientFromDb(data);
};

export const updateClient = async (client, userId) => {
    const { data, error } = await supabase
        .from('clients')
        .update(mapClientToDb(client))
        .eq('id', client.id)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return mapClientFromDb(data);
};

export const deleteClient = async (id, userId) => {
    // Önce bu danışanın seanslarını sil
    await supabase.from('sessions').delete().eq('client_id', id).eq('user_id', userId);
    const { error } = await supabase.from('clients').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
};

// ===================== SESSIONS =====================

export const fetchSessions = async (userId) => {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
    if (error) throw error;
    return data.map(mapSessionFromDb);
};

export const insertSession = async (session, userId) => {
    const { data, error } = await supabase
        .from('sessions')
        .insert({ ...mapSessionToDb(session), user_id: userId })
        .select()
        .single();
    if (error) throw error;
    return mapSessionFromDb(data);
};

export const updateSession = async (session, userId) => {
    const { data, error } = await supabase
        .from('sessions')
        .update(mapSessionToDb(session))
        .eq('id', session.id)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return mapSessionFromDb(data);
};

export const deleteSession = async (id, userId) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
};

// ===================== AUTO MIGRATION =====================
// Uygulama ilk açıldığında tabloları otomatik oluşturur

export const runAutoMigration = async () => {
    // Tablolar zaten var mı kontrol et
    const { error: checkError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true });

    // Tablo yoksa oluştur (hata kodu 42P01 = relation does not exist)
    if (checkError && checkError.code === '42P01') {
        console.info('📦 Tablolar bulunamadı, otomatik oluşturuluyor...');

        const { error: migrationError } = await supabase.rpc('exec_sql', {
            query: MIGRATION_SQL,
        });

        // rpc yoksa veya çalışmazsa, REST API ile tek tek deneyelim
        if (migrationError) {
            console.warn('RPC kullanılamıyor, tablolar Supabase Dashboard üzerinden oluşturulmalı.');
            console.info('📋 SQL Editor\'e yapıştırılacak SQL: supabase/migration.sql dosyasına bakın.');
            return false;
        }

        console.info('✅ Tablolar başarıyla oluşturuldu!');
        return true;
    }

    return true; // Tablolar zaten mevcut
};

// ===================== SEED (İlk veri yükleme) =====================

export const checkAndSeedData = async (sampleClients, generateSampleSessions, userId) => {
    // Bu kullanıcının veritabanında verisi var mı kontrol et
    const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (count > 0) return null; // Zaten veri var, seed yapma

    // Örnek danışanları ekle (user_id ile)
    const clientsToInsert = sampleClients.map((c) => ({ ...mapClientToDb(c), user_id: userId }));
    const { data: insertedClients, error: clientError } = await supabase
        .from('clients')
        .insert(clientsToInsert)
        .select();
    if (clientError) throw clientError;

    // Veritabanından dönen danışanları app formatına çevir
    const mappedClients = insertedClients.map(mapClientFromDb);

    // Örnek seansları oluştur (user_id ile)
    const sampleSessions = generateSampleSessions(mappedClients);
    const sessionsToInsert = sampleSessions.map((s) => ({ ...mapSessionToDb(s), user_id: userId }));
    const { data: insertedSessions, error: sessionError } = await supabase
        .from('sessions')
        .insert(sessionsToInsert)
        .select();
    if (sessionError) throw sessionError;

    return {
        clients: insertedClients.map(mapClientFromDb),
        sessions: insertedSessions.map(mapSessionFromDb),
    };
};

// ===================== USERS =====================

export const fetchUserByUsername = async (username) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase().trim())
        .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data ? mapUserFromDb(data) : null;
};

export const insertUser = async (user) => {
    const { data, error } = await supabase
        .from('users')
        .insert({
            username: user.username.toLowerCase().trim(),
            password_hash: user.passwordHash,
            full_name: user.fullName,
            title: user.title || '',
        })
        .select()
        .single();
    if (error) throw error;
    return mapUserFromDb(data);
};

// ===================== MAPPERS =====================
// Uygulama camelCase kullanıyor, PostgreSQL snake_case kullanıyor

const mapUserFromDb = (row) => ({
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    title: row.title || '',
    createdAt: row.created_at,
});

const mapClientFromDb = (row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone || '',
    email: row.email || '',
    birthDate: row.birth_date || '',
    gender: row.gender || '',
    emergencyContact: row.emergency_contact || '',
    notes: row.notes || '',
    diagnosis: row.diagnosis || '',
    treatmentPlan: row.treatment_plan || '',
    createdAt: row.created_at,
    isActive: row.is_active,
});

const mapClientToDb = (client) => {
    const mapped = {
        first_name: client.firstName,
        last_name: client.lastName,
        phone: client.phone || null,
        email: client.email || null,
        birth_date: client.birthDate || null,
        gender: client.gender || null,
        emergency_contact: client.emergencyContact || null,
        notes: client.notes || null,
        diagnosis: client.diagnosis || null,
        treatment_plan: client.treatmentPlan || null,
        is_active: client.isActive !== undefined ? client.isActive : true,
    };
    // Güncelleme durumunda id varsa ekle
    if (client.id) mapped.id = client.id;
    return mapped;
};

const mapSessionFromDb = (row) => ({
    id: row.id,
    clientId: row.client_id,
    date: row.date,
    duration: row.duration,
    status: row.status,
    fee: row.fee,
    paymentStatus: row.payment_status,
    mood: row.mood,
    notes: row.notes || '',
    homework: row.homework || '',
});

const mapSessionToDb = (session) => {
    const mapped = {
        client_id: session.clientId,
        date: session.date,
        duration: session.duration || 50,
        status: session.status || 'scheduled',
        fee: session.fee || 0,
        payment_status: session.paymentStatus || 'pending',
        mood: session.mood || null,
        notes: session.notes || null,
        homework: session.homework || null,
    };
    if (session.id) mapped.id = session.id;
    return mapped;
};
