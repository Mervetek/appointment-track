import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Kullanıcı bilgileri
const VALID_USER = {
    username: 'okonag',
    password: 'sincap85',
    fullName: 'Özlem Konağ',
    title: 'Psikolog',
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mevcut oturumu localStorage'dan kontrol et
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

    const signIn = async (username, password) => {
        if (username === VALID_USER.username && password === VALID_USER.password) {
            const userData = {
                username: VALID_USER.username,
                fullName: VALID_USER.fullName,
                title: VALID_USER.title,
            };
            setUser(userData);
            // 7 gün oturum süresi
            localStorage.setItem('psikotakip_auth', JSON.stringify({
                user: userData,
                expiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
            }));
            return { user: userData, error: null };
        }
        return { user: null, error: { message: 'Geçersiz kullanıcı adı veya şifre' } };
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
