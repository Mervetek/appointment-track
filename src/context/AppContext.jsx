import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { sampleClients, generateSampleSessions } from '../data/sampleData';
import { generateId } from '../utils/helpers';
import {
  isSupabaseConfigured,
  fetchClients,
  fetchSessions,
  insertClient,
  updateClient as updateClientDb,
  deleteClient as deleteClientDb,
  insertSession,
  updateSession as updateSessionDb,
  deleteSession as deleteSessionDb,
  checkAndSeedData,
  runAutoMigration,
} from '../lib/supabase';

const AppContext = createContext();

const useSupabase = isSupabaseConfigured();

// ======================== LOCAL STORAGE FALLBACK ========================

const loadFromStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

// ======================== INITIAL STATE ========================

const getInitialState = () => ({
  clients: [],
  sessions: [],
  loading: true,
  snackbar: { open: false, message: '', severity: 'success' },
});

// ======================== REDUCER ========================

const appReducer = (state, action) => {
  switch (action.type) {
    // ---- DATA LOAD ----
    case 'SET_DATA':
      return {
        ...state,
        clients: action.payload.clients,
        sessions: action.payload.sessions,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    // ---- CLIENTS ----
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload],
      };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload } : c)),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter((c) => c.id !== action.payload),
        sessions: state.sessions.filter((s) => s.clientId !== action.payload),
      };

    // ---- SESSIONS ----
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload } : s)),
      };
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
      };

    // ---- SNACKBAR ----
    case 'SHOW_SNACKBAR':
      return {
        ...state,
        snackbar: { open: true, message: action.payload.message, severity: action.payload.severity || 'success' },
      };
    case 'HIDE_SNACKBAR':
      return {
        ...state,
        snackbar: { ...state.snackbar, open: false },
      };

    default:
      return state;
  }
};

// ======================== PROVIDER ========================

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState);
  const initialized = useRef(false);

  // ---- Uygulama başlangıcında verileri yükle ----
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadData = async () => {
      if (useSupabase) {
        // ======= SUPABASE MODU =======
        try {
          // Tabloları otomatik oluştur (yoksa)
          await runAutoMigration();

          // Veritabanında veri yoksa örnek verileri yükle
          await checkAndSeedData(sampleClients, generateSampleSessions);

          // Veritabanından oku
          const [clients, sessions] = await Promise.all([fetchClients(), fetchSessions()]);
          dispatch({ type: 'SET_DATA', payload: { clients, sessions } });
        } catch (err) {
          console.error('Supabase veri yükleme hatası:', err);
          // Hata olursa localStorage'a fallback
          loadLocalData();
        }
      } else {
        // ======= LOCALSTORAGE MODU =======
        console.info('⚠️ Supabase yapılandırılmamış — localStorage kullanılıyor.');
        loadLocalData();
      }
    };

    const loadLocalData = () => {
      const storedClients = loadFromStorage('psikolog_clients', null);
      const storedSessions = loadFromStorage('psikolog_sessions', null);
      const clients = storedClients || sampleClients;
      const sessions = storedSessions || generateSampleSessions(clients);
      dispatch({ type: 'SET_DATA', payload: { clients, sessions } });
    };

    loadData();
  }, []);

  // ---- localStorage fallback: değişiklikleri kaydet ----
  useEffect(() => {
    if (!useSupabase && !state.loading) {
      localStorage.setItem('psikolog_clients', JSON.stringify(state.clients));
    }
  }, [state.clients, state.loading]);

  useEffect(() => {
    if (!useSupabase && !state.loading) {
      localStorage.setItem('psikolog_sessions', JSON.stringify(state.sessions));
    }
  }, [state.sessions, state.loading]);

  // ======================== ACTION FONKSIYONLARI ========================

  const addClient = useCallback(async (clientData) => {
    if (useSupabase) {
      try {
        const newClient = await insertClient({
          ...clientData,
          isActive: true,
        });
        dispatch({ type: 'ADD_CLIENT', payload: newClient });
        return newClient;
      } catch (err) {
        console.error('Danışan ekleme hatası:', err);
        throw err;
      }
    } else {
      const newClient = {
        ...clientData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      dispatch({ type: 'ADD_CLIENT', payload: newClient });
      return newClient;
    }
  }, []);

  const editClient = useCallback(async (clientData) => {
    if (useSupabase) {
      try {
        const updated = await updateClientDb(clientData);
        dispatch({ type: 'UPDATE_CLIENT', payload: updated });
        return updated;
      } catch (err) {
        console.error('Danışan güncelleme hatası:', err);
        throw err;
      }
    } else {
      dispatch({ type: 'UPDATE_CLIENT', payload: clientData });
      return clientData;
    }
  }, []);

  const removeClient = useCallback(async (id) => {
    if (useSupabase) {
      try {
        await deleteClientDb(id);
        dispatch({ type: 'DELETE_CLIENT', payload: id });
      } catch (err) {
        console.error('Danışan silme hatası:', err);
        throw err;
      }
    } else {
      dispatch({ type: 'DELETE_CLIENT', payload: id });
    }
  }, []);

  const addSession = useCallback(async (sessionData) => {
    if (useSupabase) {
      try {
        const newSession = await insertSession(sessionData);
        dispatch({ type: 'ADD_SESSION', payload: newSession });
        return newSession;
      } catch (err) {
        console.error('Seans ekleme hatası:', err);
        throw err;
      }
    } else {
      const newSession = { ...sessionData, id: generateId() };
      dispatch({ type: 'ADD_SESSION', payload: newSession });
      return newSession;
    }
  }, []);

  const editSession = useCallback(async (sessionData) => {
    if (useSupabase) {
      try {
        const updated = await updateSessionDb(sessionData);
        dispatch({ type: 'UPDATE_SESSION', payload: updated });
        return updated;
      } catch (err) {
        console.error('Seans güncelleme hatası:', err);
        throw err;
      }
    } else {
      dispatch({ type: 'UPDATE_SESSION', payload: sessionData });
      return sessionData;
    }
  }, []);

  const removeSession = useCallback(async (id) => {
    if (useSupabase) {
      try {
        await deleteSessionDb(id);
        dispatch({ type: 'DELETE_SESSION', payload: id });
      } catch (err) {
        console.error('Seans silme hatası:', err);
        throw err;
      }
    } else {
      dispatch({ type: 'DELETE_SESSION', payload: id });
    }
  }, []);

  // ======================== HELPER FONKSIYONLAR ========================

  const getClientById = (id) => state.clients.find((c) => c.id === id);

  const getSessionsByClient = (clientId) =>
    state.sessions.filter((s) => s.clientId === clientId).sort((a, b) => new Date(b.date) - new Date(a.date));

  const getTodaySessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return state.sessions
      .filter((s) => {
        const d = new Date(s.date);
        return d >= today && d < tomorrow;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return state.sessions
      .filter((s) => new Date(s.date) >= now && s.status === 'scheduled')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getCompletedSessions = () => state.sessions.filter((s) => s.status === 'completed');

  const getTotalRevenue = () =>
    state.sessions.filter((s) => s.paymentStatus === 'paid').reduce((sum, s) => sum + (s.fee || 0), 0);

  const getPendingPayments = () =>
    state.sessions.filter((s) => s.status === 'completed' && s.paymentStatus === 'pending');

  const showSnackbar = (message, severity = 'success') => {
    dispatch({ type: 'SHOW_SNACKBAR', payload: { message, severity } });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        dispatch,
        // CRUD aksiyonlar
        addClient,
        editClient,
        removeClient,
        addSession,
        editSession,
        removeSession,
        // Helpers
        getClientById,
        getSessionsByClient,
        getTodaySessions,
        getUpcomingSessions,
        getCompletedSessions,
        getTotalRevenue,
        getPendingPayments,
        showSnackbar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
