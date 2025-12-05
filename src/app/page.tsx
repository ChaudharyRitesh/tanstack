"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TodoList } from "@/features/todos/components/TodoList";

export default function Home() {
  const { session, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Todos</h1>
          <p className="text-gray-600">
            Welcome, {session?.user?.name || session?.user?.email}
          </p>
        </div>

        {session?.user && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <TodoList userId={parseInt((session.user as any).id || "1")} />
        )}
      </div>
    </div>
  );
}
