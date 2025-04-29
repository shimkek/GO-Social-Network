"use client";
import { LoginForm } from "@/components/login-form"
import { authApi } from "@/lib/api";
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';


export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    async function handleLogin(data: { email: string; password: string }) {
        const res = await authApi.login(data);
        if (res.status == 201) {
            login();
            router.push("/feed");
        }
        console.log(res);
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <LoginForm onSubmit={handleLogin} />
            </div>
        </div>
    )

}