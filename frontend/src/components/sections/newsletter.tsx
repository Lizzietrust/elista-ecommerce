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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="grow px-6 py-4 rounded-xl bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-accent/50 transition-all duration-300"
                required
              />
              <button
                type="submit"
                className="bg-accent hover:bg-accent-light text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 whitespace-nowrap hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Send size={20} />
                Subscribe Now
              </button>
            </form>
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
