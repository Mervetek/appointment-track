import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserByUsername, insertUser } from '../lib/supabase';

const AuthContext = createContext();

// Basit hash fonksiyonu (production'da bcrypt kullanılmalı)
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mevcut oturumu localStorage'dan kontrol et (sadece session bilgisi)
        const stored = localStorage.getItem('psikotakip_auth');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Oturum süresi kontrolü (7 gün)
                if (parsed.expiry && Date.now() < parsed.expiry) {
                    setUser(parsed.user);
                } else {
                    localStorage.removeItem('psikotakip_auth');
                }
            } catch {
                localStorage.removeItem('psikotakip_auth');
            }
        }
        setLoading(false);
    }, []);

    // Oturum bilgisini localStorage'a kaydet
    const saveSession = (userData) => {
        setUser(userData);
        localStorage.setItem('psikotakip_auth', JSON.stringify({
            user: userData,
            expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 gün
        }));
    };

    // Kullanıcı kaydı (Supabase)
    const signUp = async (username, password, fullName, title = '') => {
        const trimmedUsername = username.toLowerCase().trim();
        const passwordHash = simpleHash(password);

        try {
            // Kullanıcı adı müsait mi kontrol et
            const existing = await fetchUserByUsername(trimmedUsername);
            if (existing) {
                return { user: null, error: { message: 'username_exists' } };
            }

            const newUser = await insertUser({
                username: trimmedUsername,
                passwordHash,
                fullName,
                title,
            });

            const userData = {
                id: newUser.id,
                username: newUser.username,
                fullName: newUser.fullName,
                title: newUser.title,
                plan: newUser.plan || 'premium',
                trialStart: newUser.trialStart || newUser.createdAt,
                trialEnd: newUser.trialEnd,
                subscriptionEnd: newUser.subscriptionEnd,
                createdAt: newUser.createdAt,
            };
            saveSession(userData);
            return { user: userData, error: null };
        } catch (err) {
            // Unique constraint violation
            if (err.code === '23505') {
                return { user: null, error: { message: 'username_exists' } };
            }
            return { user: null, error: { message: err.message } };
        }
    };

    // Giriş (Supabase)
    const signIn = async (username, password) => {
        const trimmedUsername = username.toLowerCase().trim();
        const passwordHash = simpleHash(password);

        try {
            const foundUser = await fetchUserByUsername(trimmedUsername);
            if (!foundUser || foundUser.passwordHash !== passwordHash) {
                return { user: null, error: { message: 'invalid_credentials' } };
            }

            const userData = {
                id: foundUser.id,
                username: foundUser.username,
                fullName: foundUser.fullName,
                title: foundUser.title,
                plan: foundUser.plan || 'premium',
                trialStart: foundUser.trialStart || foundUser.createdAt,
                trialEnd: foundUser.trialEnd,
                subscriptionEnd: foundUser.subscriptionEnd,
                createdAt: foundUser.createdAt,
            };
            saveSession(userData);
            return { user: userData, error: null };
        } catch (err) {
            return { user: null, error: { message: err.message } };
        }
    };

    const signOut = async () => {
        setUser(null);
        localStorage.removeItem('psikotakip_auth');
    };

    const getUserName = () => {
        return user?.fullName || '';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn,
                signUp,
                signOut,
                getUserName,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
