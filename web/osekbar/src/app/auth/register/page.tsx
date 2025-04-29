"use client"; 
import { RegisterForm } from "@/components/register-form"

export default function LoginPage() {


    function handleRegister(data: { email: string; password: string }) {
        console.log(`form submitted ${data.email}:${data.password}`);
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <RegisterForm onSubmit={handleRegister} />
            </div>
        </div>
    )

}