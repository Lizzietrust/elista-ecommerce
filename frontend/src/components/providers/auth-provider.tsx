"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      // In real app, fetch from your API
      // const response = await fetch('/api/auth/session');
      // const data = await response.json();

      // Mock session for development
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        role: "user",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      setUser(mockUser);
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In real app, call your API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // Mock login for development
      if (email === "john@example.com" && password === "password123") {
        const mockUser: User = {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
          role: "user",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        };

        setUser(mockUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // In real app, call your API
      // await fetch('/api/auth/logout', { method: 'POST' });

      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      // In real app, call your API
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });

      // Mock registration for development
      const mockUser: User = {
        id: (Math.random() * 1000).toString(),
        name,
        email,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      // In real app, call your API
      // const response = await fetch('/api/auth/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates),
      // });

      // Mock update for development
      setUser({ ...user, ...updates });
      return true;
    } catch (error) {
      console.error("Profile update failed:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
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
