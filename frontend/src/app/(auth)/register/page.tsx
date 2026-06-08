"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "react-hot-toast";

const tokens = {
  fg: "#1A1A1A",
  fgMuted: "#8C7B6E",
  border: "#E4DDD7",
  bg: "#FAFAF9",
  accent: "#C17B4D",
  accentDark: "#A5663C",
  destructive: "#B05050",
  success: "#5A8A5A",
  serif: "'Georgia', 'Times New Roman', serif",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
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
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    else if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";
    else if (!/^[a-zA-Z\s]+$/.test(formData.name))
      newErrors.name = "Name can only contain letters and spaces";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10,15}$/.test(formData.phone))
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password =
        "Password must contain uppercase, lowercase, and a number";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the Terms of Service";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.phone,
    );

    if (success) {
      toast.success(
        "Welcome to Elista! Your account has been created successfully.",
      );
      router.push("/");
    } else {
      setErrors({
        general: "Registration failed. This email might already be registered.",
      });
      toast.error("Registration failed. Please try again.");
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    if (score <= 2)
      return { label: "Weak", color: tokens.destructive, width: "25%" };
    if (score <= 4) return { label: "Medium", color: "#C17B4D", width: "55%" };
    if (score <= 5)
      return { label: "Strong", color: tokens.success, width: "78%" };
    return { label: "Very Strong", color: tokens.success, width: "100%" };
  };

  const passwordStrength = formData.password
    ? getPasswordStrength(formData.password)
    : null;

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

  const mkInputStyle = (errKey: keyof typeof errors): React.CSSProperties => ({
    ...inputBase,
    ...(errors[errKey] ? { borderColor: tokens.destructive } : {}),
  });

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement>,
    errKey: keyof typeof errors,
  ) => {
    if (!errors[errKey]) {
      e.target.style.borderColor = tokens.accent;
      e.target.style.boxShadow = "0 0 0 3px rgba(193,123,77,0.12)";
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    errKey: keyof typeof errors,
  ) => {
    if (!errors[errKey]) {
      e.target.style.borderColor = tokens.border;
      e.target.style.boxShadow = "none";
    }
  };

  return (
    <div>
      <h1
        className="text-4xl font-semibold mb-1 tracking-tight"
        style={{ fontFamily: tokens.serif, color: tokens.fg }}
      >
        Create Account
      </h1>
      <p className="text-sm mb-8" style={{ color: tokens.fgMuted }}>
        Join Elista for the best shopping experience
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
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
            style={{ color: tokens.fgMuted }}
          >
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={authLoading}
            style={mkInputStyle("name")}
            onFocus={(e) => handleFocus(e, "name")}
            onBlur={(e) => handleBlur(e, "name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs" style={{ color: tokens.destructive }}>
              {errors.name}
            </p>
          )}
        </div>

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
            placeholder="you@example.com"
            disabled={authLoading}
            style={mkInputStyle("email")}
            onFocus={(e) => handleFocus(e, "email")}
            onBlur={(e) => handleBlur(e, "email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs" style={{ color: tokens.destructive }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
            style={{ color: tokens.fgMuted }}
          >
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="08012345678"
            disabled={authLoading}
            style={mkInputStyle("phone")}
            onFocus={(e) => handleFocus(e, "phone")}
            onBlur={(e) => handleBlur(e, "phone")}
          />
          {errors.phone && (
            <p className="mt-1.5 text-xs" style={{ color: tokens.destructive }}>
              {errors.phone}
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
              placeholder="Create a strong password"
              disabled={authLoading}
              style={{ ...mkInputStyle("password"), paddingRight: "42px" }}
              onFocus={(e) => handleFocus(e, "password")}
              onBlur={(e) => handleBlur(e, "password")}
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

          {/* Strength bar */}
          {formData.password && passwordStrength && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: tokens.fgMuted }}>
                  Strength
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: tokens.border }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: passwordStrength.width,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </div>
            </div>
          )}

          {errors.password && (
            <p className="mt-1.5 text-xs" style={{ color: tokens.destructive }}>
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
            style={{ color: tokens.fgMuted }}
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={authLoading}
              style={{
                ...inputBase,
                paddingRight: "42px",
                borderColor: errors.confirmPassword
                  ? tokens.destructive
                  : formData.confirmPassword &&
                      formData.password === formData.confirmPassword
                    ? tokens.success
                    : tokens.border,
              }}
              onFocus={(e) => handleFocus(e, "confirmPassword")}
              onBlur={(e) => handleBlur(e, "confirmPassword")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: tokens.fgMuted }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.password === formData.confirmPassword && (
              <p
                className="mt-1 text-xs flex items-center gap-1"
                style={{ color: tokens.success }}
              >
                <Check size={11} /> Passwords match
              </p>
            )}
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs" style={{ color: tokens.destructive }}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="sr-only"
                disabled={authLoading}
              />
              <div
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{
                  border: `1.5px solid ${formData.agreeToTerms ? tokens.accent : tokens.border}`,
                  backgroundColor: formData.agreeToTerms
                    ? tokens.accent
                    : "transparent",
                }}
              >
                {formData.agreeToTerms && (
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
            <span
              className="text-xs leading-relaxed"
              style={{ color: tokens.fgMuted }}
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="hover:underline"
                style={{ color: tokens.accent }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="hover:underline"
                style={{ color: tokens.accent }}
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1.5 text-xs" style={{ color: tokens.destructive }}>
              {errors.agreeToTerms}
            </p>
          )}
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
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Sign in link */}
        <p
          className="text-center text-xs pt-1"
          style={{ color: tokens.fgMuted }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: tokens.accent }}
          >
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}
