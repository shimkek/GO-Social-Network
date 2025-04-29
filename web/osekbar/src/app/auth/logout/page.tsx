"use client";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useAuth } from '@/app/context/AuthContext';


export default function LogoutPage() {
    const { logout } = useAuth();
    async function handleLogout(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
        event.preventDefault();
        try {
            const res = await authApi.logout();
            if (res.status == 200) {
                logout();
            }
            console.log(res.status);
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    }

    return (
        <Button onClick={handleLogout}>Log out</Button>
    );
} 