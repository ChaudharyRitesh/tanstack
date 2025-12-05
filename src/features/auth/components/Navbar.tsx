"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Navbar() {
  const { session, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Determine auth provider
  const getAuthProvider = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = (session as any)?.provider;
    if (!provider) return "Email/Password";
    if (provider === "google") return "Google";
    if (provider === "github") return "GitHub";
    return "Unknown";
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-blue-200">
          Todo App
        </Link>
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{session?.user?.email}</p>
              <p className="text-xs text-blue-100">via {getAuthProvider()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
