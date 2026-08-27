import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    token: string | null;
    username: string | null;
    isAuthenticated: boolean;
    login: (token: string, username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('histeria_admin_token');
    });
    const [username, setUsername] = useState<string | null>(() => {
        return localStorage.getItem('histeria_admin_username');
    });

    const isAuthenticated = !!token;

    const login = (newToken: string, newUsername: string) => {
        setToken(newToken);
        setUsername(newUsername);
        localStorage.setItem('histeria_admin_token', newToken);
        localStorage.setItem('histeria_admin_username', newUsername);
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
        localStorage.removeItem('histeria_admin_token');
        localStorage.removeItem('histeria_admin_username');
    };

    // Check JWT token expiry on mount and whenever token changes
    useEffect(() => {
        if (!token) return;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                // Token is expired — clear session silently
                logout();
            }
        } catch {
            // Malformed token — clear it
            logout();
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, username, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
