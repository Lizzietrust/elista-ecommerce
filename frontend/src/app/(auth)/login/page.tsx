"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const tokens = {
  fg: "#1A1A1A",
  fgMuted: "#8C7B6E",
  border: "#E4DDD7",
  bg: "#FAFAF9",
  accent: "#C17B4D",
  accentDark: "#A5663C",
  destructive: "#B05050",
  serif: "'Georgia', 'Times New Roman', serif",
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const success = await login(formData.email, formData.password);
    if (success) {
      router.push("/");
    } else {
      setErrors({ general: "Invalid email or password. Please try again." });
    }
  };

  /* Shared input style */
  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: "0.875rem",
    borderRadius: "8px",
    border: `1.5px solid ${tokens.border}`,
    backgroundColor: tokens.bg,
    color: tokens.fg,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const inputError: React.CSSProperties = {
    ...inputBase,
    borderColor: tokens.destructive,
  };

  return (
    <div>
      {/* Heading */}
      <h1
        className="text-4xl font-semibold mb-1 tracking-tight"
        style={{ fontFamily: tokens.serif, color: tokens.fg }}
      >
        Login
      </h1>
      <p className="text-sm mb-8" style={{ color: tokens.fgMuted }}>
        Welcome back — sign in to continue
      </p>

      {/* General error */}
      {errors.general && (
        <div
          className="mb-5 p-3.5 rounded-lg flex items-start gap-3 text-sm"
          style={{
            backgroundColor: "rgba(176,80,80,0.07)",
            borderLeft: `3px solid ${tokens.destructive}`,
            color: tokens.destructive,
          }}
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
            style={{ color: tokens.fgMuted }}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Type your email"
            disabled={authLoading}
            style={errors.email ? inputError : inputBase}
            onFocus={(e) => {
              if (!errors.email) {
                e.target.style.borderColor = tokens.accent;
                e.target.style.boxShadow = "0 0 0 3px rgba(193,123,77,0.12)";
              }
            }}
            onBlur={(e) => {
              if (!errors.email) {
                e.target.style.borderColor = tokens.border;
                e.target.style.boxShadow = "none";
              }
            }}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs" style={{ color: tokens.destructive }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
            style={{ color: tokens.fgMuted }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Type your password"
              disabled={authLoading}
              style={{
                ...(errors.password ? inputError : inputBase),
                paddingRight: "42px",
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = tokens.accent;
                  e.target.style.boxShadow = "0 0 0 3px rgba(193,123,77,0.12)";
                }
              }}
              onBlur={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = tokens.border;
                  e.target.style.boxShadow = "none";
                }
              }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: tokens.fgMuted }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs" style={{ color: tokens.destructive }}>
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="sr-only peer"
                disabled={authLoading}
              />
              <div
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{
                  border: `1.5px solid ${formData.rememberMe ? tokens.accent : tokens.border}`,
                  backgroundColor: formData.rememberMe
                    ? tokens.accent
                    : "transparent",
                }}
              >
                {formData.rememberMe && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path
                      d="M1 3L3 5L7 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs" style={{ color: tokens.fgMuted }}>
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs transition-colors hover:underline"
            style={{ color: tokens.accent }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={authLoading}
          className="w-full py-3 rounded-lg text-sm font-medium tracking-wide transition-all mt-1"
          style={{
            backgroundColor: tokens.accent,
            color: "#fff",
            opacity: authLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              tokens.accentDark;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              tokens.accent;
          }}
        >
          {authLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            "Log in"
          )}
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div
              className="w-full"
              style={{ borderTop: `1px solid ${tokens.border}` }}
            />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-4 text-xs bg-white"
              style={{ color: tokens.fgMuted }}
            >
              Or
            </span>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg text-sm font-medium transition-all"
          style={{
            border: `1.5px solid ${tokens.border}`,
            color: tokens.fg,
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              tokens.bg;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent";
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Sign up */}
        <p
          className="text-center text-xs pt-1"
          style={{ color: tokens.fgMuted }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold transition-colors hover:underline"
            style={{ color: tokens.accent }}
          >
            Sign up for free
          </Link>
        </p>
      </form>
    </div>
  );
}
