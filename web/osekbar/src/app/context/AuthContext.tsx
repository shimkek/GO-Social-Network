"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "react";


interface AuthContextType {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const localFlag = localStorage.getItem("isLoggedIn") === "true";
        setLoggedIn(localFlag ? true : false);
        setLoading(false);
    }, []);

    const login = () => {
        localStorage.setItem("isLoggedIn", "true");
        setLoggedIn(true);
    };
    const logout = () => {
        localStorage.setItem("isLoggedIn", "false");
        setLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout , isLoading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};