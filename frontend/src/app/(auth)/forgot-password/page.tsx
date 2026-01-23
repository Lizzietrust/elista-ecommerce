"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        href="/login"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-8"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to login
      </Link>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Forgot Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter your email to receive a password reset link
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center p-8">
          <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Check Your Email
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setEmail("");
                setIsSubmitted(false);
              }}
              className="w-full"
            >
              Send another link
            </Button>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Return to login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                placeholder="you@example.com"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending link...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
