"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, connect to your email service here
    console.log("Submitting email:", email);
    setSubmitted(true);
    setEmail("");

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="py-12 md:py-16 bg-linear-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay in the Loop
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Subscribe to our newsletter for exclusive deals, new arrivals, and
            style tips.
          </p>

          {submitted ? (
            <div className="bg-green-500/20 border border-green-500 rounded-xl p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <Check size={32} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-gray-300">
                You've successfully subscribed to our newsletter.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="grow px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 whitespace-nowrap"
              >
                <Send size={20} />
                Subscribe Now
              </button>
            </form>
          )}

          <p className="text-gray-400 text-sm mt-6">
            By subscribing, you agree to our Privacy Policy. No spam,
            unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
