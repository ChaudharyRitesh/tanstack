import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    logout,
  };
};
