"use client";
import {createContext, useContext, useEffect, useState, ReactNode} from "react";
import {getToken, clearToken} from "@/lib/token";
import {jwtDecode} from "jwt-decode";
import {logout as apiLogout} from "@/lib/api/auth";

interface User {
    sub: string;
    scope: "ROLE_ADMIN" | "ROLE_STAFF" | "ROLE_MEMBER";
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode<User>(token);
                setUser(decoded);
            } catch {
                clearToken();
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        // Clear session immediately for snappy UX
        clearToken();
        setUser(null);
        // Fire-and-forget API logout; do not block UI
        try {
            void apiLogout();
        } catch {}
    };

    return (
        <AuthContext.Provider value={{user, isAuthenticated: !!user, loading, logout: handleLogout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
