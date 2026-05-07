"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Check, AlertCircle } from "lucide-react";
import { useSubscribeToNewsletter } from "@/lib/hooks/use-newsletter";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState("");
  const [displayError, setDisplayError] = useState("");
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    mutate: subscribe,
    isPending: isLoading,
    error: mutationError,
    reset: resetMutation,
  } = useSubscribeToNewsletter();

  useEffect(() => {
    if (mutationError?.message) {
      const errorMessage = mutationError.message;
      setDisplayError(errorMessage);

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      errorTimeoutRef.current = setTimeout(() => {
        setDisplayError("");
        resetMutation();
      }, 5000);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [mutationError, resetMutation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailToSubmit = email;
    setLastSubmittedEmail(emailToSubmit);

    setEmail("");

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setDisplayError("");
    resetMutation();

    subscribe(
      { email: emailToSubmit, source: "newsletter_form" },
      {
        onSuccess: () => {
          setSubmitted(true);
          setLastSubmittedEmail("");

          setTimeout(() => setSubmitted(false), 5000);
        },
        onError: () => {
          inputRef.current?.focus();
        },
      },
    );
  };

  const handleRetry = () => {
    if (lastSubmittedEmail) {
      setEmail(lastSubmittedEmail);
      setDisplayError("");
      resetMutation();

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const isDuplicateError = displayError === "Email already subscribed";
  const hasError = !!displayError;

  return (
    <section className="py-12 md:py-16 bg-gradient-forest text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay in the Loop
          </h2>
          <p className="text-xl text-secondary-light mb-8">
            Subscribe to our newsletter for exclusive deals, new arrivals, and
            style tips.
          </p>

          {submitted ? (
            <div className="bg-success/20 border border-success rounded-xl p-8 max-w-md mx-auto animate-fade-in">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-success p-3 rounded-full">
                  <Check size={32} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Thank You!</h3>
              <p className="text-secondary-light">
                You've successfully subscribed to our newsletter.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
            >
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-300 border ${
                    hasError ? "border-red-400" : "border-white/20"
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-accent hover:bg-accent-light text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 whitespace-nowrap hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Subscribe Now
                  </>
                )}
              </button>
            </form>
          )}

          {hasError && !submitted && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-400 rounded-lg max-w-md mx-auto animate-fade-in">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <p className="text-red-400 text-sm">
                  {isDuplicateError
                    ? "This email is already subscribed to our newsletter."
                    : displayError}
                </p>
                {!isDuplicateError && lastSubmittedEmail && (
                  <button
                    onClick={handleRetry}
                    className="text-xs text-accent hover:text-accent-light underline ml-2 transition-colors duration-200"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-secondary-light text-sm mt-6">
            By subscribing, you agree to our Privacy Policy. No spam,
            unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
