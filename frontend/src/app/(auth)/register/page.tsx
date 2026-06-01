"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "react-hot-toast";

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

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.phone,
    );

    if (success) {
      toast.success(
        "Account created successfully! Please check your email to verify your account.",
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

    if (score <= 2) return { label: "Weak", color: "#C17B7B", width: "25%" };
    if (score <= 4) return { label: "Medium", color: "#D4A56B", width: "50%" };
    if (score <= 5) return { label: "Strong", color: "#6B8E6B", width: "75%" };
    return { label: "Very Strong", color: "#6B8E6B", width: "100%" };
  };

  const passwordStrength = formData.password
    ? getPasswordStrength(formData.password)
    : null;

  const passwordRequirements = [
    { label: "At least 6 characters", met: formData.password.length >= 6 },
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "One lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "One number", met: /\d/.test(formData.password) },
    {
      label: "One special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    },
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2C2C2C] dark:text-white">
          Create Account
        </h2>
        <p className="text-[#6B6B6B] dark:text-gray-400 mt-2">
          Join Elista for the best shopping experience
        </p>
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="mb-6 p-4 bg-[#C17B7B]/10 dark:bg-[#C17B7B]/20 border border-[#C17B7B]/30 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-[#C17B7B] shrink-0" size={20} />
            <p className="text-[#C17B7B] text-sm">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2"
          >
            Full Name
          </label>
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
              size={20}
            />
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                errors.name
                  ? "border-[#C17B7B] focus:border-[#C17B7B] focus:ring-[#C17B7B]"
                  : "border-[#E8E0D8] focus:border-[#C17B4D] focus:ring-[#C17B4D]"
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 transition-colors`}
              placeholder="John Doe"
              disabled={authLoading}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-[#C17B7B]">{errors.name}</p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
              size={20}
            />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                errors.email
                  ? "border-[#C17B7B] focus:border-[#C17B7B] focus:ring-[#C17B7B]"
                  : "border-[#E8E0D8] focus:border-[#C17B4D] focus:ring-[#C17B4D]"
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 transition-colors`}
              placeholder="you@example.com"
              disabled={authLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-[#C17B7B]">{errors.email}</p>
          )}
        </div>

        {/* Phone Input */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
              size={20}
            />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                errors.phone
                  ? "border-[#C17B7B] focus:border-[#C17B7B] focus:ring-[#C17B7B]"
                  : "border-[#E8E0D8] focus:border-[#C17B4D] focus:ring-[#C17B4D]"
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 transition-colors`}
              placeholder="08012345678"
              disabled={authLoading}
            />
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-[#C17B7B]">{errors.phone}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
              size={20}
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border ${
                errors.password
                  ? "border-[#C17B7B] focus:border-[#C17B7B] focus:ring-[#C17B7B]"
                  : "border-[#E8E0D8] focus:border-[#C17B4D] focus:ring-[#C17B4D]"
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 transition-colors`}
              placeholder="Create a strong password"
              disabled={authLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] hover:text-[#2C2C2C] dark:hover:text-gray-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {formData.password && passwordStrength && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#6B6B6B]">
                  Password strength:
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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

          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-3 space-y-1.5">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                      req.met
                        ? "bg-[#6B8E6B]/10"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    {req.met ? (
                      <Check size={10} className="text-[#6B8E6B]" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${req.met ? "text-[#6B8E6B]" : "text-[#6B6B6B]"}`}
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {errors.password && (
            <p className="mt-2 text-sm text-[#C17B7B]">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
              size={20}
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border ${
                errors.confirmPassword
                  ? "border-[#C17B7B] focus:border-[#C17B7B] focus:ring-[#C17B7B]"
                  : formData.confirmPassword &&
                      formData.password === formData.confirmPassword
                    ? "border-[#6B8E6B] focus:border-[#6B8E6B] focus:ring-[#6B8E6B]"
                    : "border-[#E8E0D8] focus:border-[#C17B4D] focus:ring-[#C17B4D]"
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 transition-colors`}
              placeholder="Confirm your password"
              disabled={authLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] hover:text-[#2C2C2C] dark:hover:text-gray-300"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.password === formData.confirmPassword && (
              <p className="mt-1 text-xs text-[#6B8E6B] flex items-center gap-1">
                <Check size={12} />
                Passwords match
              </p>
            )}
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-[#C17B7B]">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms Agreement */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="h-5 w-5 mt-0.5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D] cursor-pointer"
              disabled={authLoading}
            />
            <div className="text-sm">
              <span className="text-[#6B6B6B] dark:text-gray-300">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[#C17B4D] hover:text-[#D49A6A] transition-colors underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#C17B4D] hover:text-[#D49A6A] transition-colors underline"
                >
                  Privacy Policy
                </Link>
              </span>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-[#C17B7B]">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-3 text-lg bg-[#2C3E3E] hover:bg-[#4A6B6B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={authLoading}
        >
          {authLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Sign In Link */}
        <div className="text-center pt-6 border-t border-[#E8E0D8]">
          <p className="text-[#6B6B6B] dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#C17B4D] font-semibold hover:text-[#D49A6A] transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
