'use client';

import { useAuth } from '@/app/context/AuthContext';
import { usePathname } from "next/navigation";
import Link from 'next/link';

export default function Header() {
    const { isLoggedIn } = useAuth();
    const pathname = usePathname();

    return (
        <header className="bg-white">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left Spacer */}
                <div className="flex-1"></div>

                {/* Logo */}
                <Link className="text-lg font-bold text-gray-800" href="/feed">
                    ÖsekBar
                </Link>

                {/* Auth Buttons */}
                <div className="flex-1 flex justify-end">
                    {!isLoggedIn ? (
                        <>
                            <Link
                                className="rounded-md bg-gray-800 px-4 py-2 text-sm mx-4 font-medium text-white transition hover:bg-gray-900"
                                href="/auth/login"
                            >
                                Login
                            </Link>
                            <Link
                                className="hidden sm:block rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition hover:text-gray-900"
                                href="/auth/register"
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <Link
                            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition hover:text-gray-900"
                            href="/auth/logout"
                        >
                            Logout
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="block rounded-md bg-gray-100 p-2 text-gray-600 transition hover:text-gray-800 md:hidden"
                >
                    <span className="sr-only">Toggle menu</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    );
}