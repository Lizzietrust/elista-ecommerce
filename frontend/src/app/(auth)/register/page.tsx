"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
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
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (error) {
      setErrors({ general: "Registration failed. Please try again." });
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "Number", met: /\d/.test(formData.password) },
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

      {errors.general && (
        <div className="mb-6 p-4 bg-[#C17B7B]/10 dark:bg-[#C17B7B]/20 border border-[#C17B7B]/30 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-[#C17B7B]" size={20} />
            <p className="text-[#C17B7B]">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2`}
              placeholder="John Doe"
              disabled={isLoading}
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
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-[#C17B7B]">{errors.email}</p>
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
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2`}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] hover:text-[#2C2C2C] dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="mt-3 space-y-2">
            {passwordRequirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center ${
                    req.met ? "bg-[#6B8E6B]/10" : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {req.met ? (
                    <Check size={12} className="text-[#6B8E6B]" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  )}
                </div>
                <span
                  className={`text-sm ${req.met ? "text-[#6B8E6B]" : "text-[#6B6B6B]"}`}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>

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
                  : "border-[#E8E0D8] focus:border-[#C17B4D] focus:ring-[#C17B4D]"
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] hover:text-[#2C2C2C] dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-[#C17B7B]">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms Agreement */}
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="h-5 w-5 mt-1 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
              disabled={isLoading}
            />
            <div className="text-sm">
              <span className="text-[#6B6B6B] dark:text-gray-300">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[#C17B4D] hover:text-[#D49A6A] transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#C17B4D] hover:text-[#D49A6A] transition-colors"
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
          className="w-full py-3 text-lg bg-[#2C3E3E] hover:bg-[#4A6B6B] transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
