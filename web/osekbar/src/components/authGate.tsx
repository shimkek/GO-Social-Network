'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        )
    }

    return <>{children}</>;
}