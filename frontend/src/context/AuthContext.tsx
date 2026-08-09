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

    // Optional: check JWT token expiry or validate on bootstrap
    useEffect(() => {
        // If token exists, we can do some simple verification
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
