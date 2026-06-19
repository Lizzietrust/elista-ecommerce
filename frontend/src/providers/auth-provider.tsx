"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
} from "@/lib/hooks/use-auth";
import type { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError,
    refetch,
  } = useCurrentUser({
    enabled: hasToken,
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (isError || !hasToken) {
      setUser(null);
    }

    if (!isUserLoading) {
      setIsLoading(false);
    }
  }, [currentUser, isUserLoading, isError, hasToken]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await loginMutation.mutateAsync({
          email,
          password,
        });

        console.log("Login response:", response);

        if (response && response.user) {
          setUser(response.user);
          await refetch();
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Login failed:", error);
        const errorMessage = error?.message || "Login failed";
        throw new Error(errorMessage);
      }
    },
    [loginMutation, refetch],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        sessionStorage.clear();
      }
      setUser(null);
    }
  }, [logoutMutation]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
      phone: string,
    ): Promise<boolean> => {
      try {
        console.log("Attempting registration...");
        const response = await registerMutation.mutateAsync({
          name,
          email,
          password,
          confirmPassword,
          phone,
        });

        console.log("Registration response:", response);

        if (response && response.user) {
          setUser(response.user);
          await refetch();
          return true;
        }

        console.error("Invalid response structure:", response);
        return false;
      } catch (error: any) {
        console.error("Registration failed in provider:", error);
        const errorMessage = error?.message || "Registration failed";
        throw new Error(errorMessage);
      }
    },
    [registerMutation, refetch],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
