"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Truck,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<CheckoutFormData>;
}

export interface CheckoutFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Shipping Address
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Payment Information
  paymentMethod: "card" | "paypal" | "applepay" | "googlepay";
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  saveCard?: boolean;

  // Billing
  billingSameAsShipping: boolean;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;

  // Additional
  notes?: string;
  agreeToTerms: boolean;
  receiveUpdates: boolean;
}

const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
];

const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "💳",
    description: "Pay with Visa, Mastercard, or Amex",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "🔵",
    description: "Pay securely with your PayPal account",
  },
  {
    id: "applepay",
    name: "Apple Pay",
    icon: "🍎",
    description: "Pay with Apple Pay",
  },
  {
    id: "googlepay",
    name: "Google Pay",
    icon: "📱",
    description: "Pay with Google Pay",
  },
];

export default function CheckoutForm({
  onSubmit,
  isLoading = false,
  initialData = {},
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    apartment: initialData.apartment || "",
    city: initialData.city || "",
    state: initialData.state || "",
    zipCode: initialData.zipCode || "",
    country: initialData.country || "US",
    paymentMethod: initialData.paymentMethod || "card",
    cardNumber: initialData.cardNumber || "",
    cardName: initialData.cardName || "",
    expiryDate: initialData.expiryDate || "",
    cvv: initialData.cvv || "",
    saveCard: initialData.saveCard || false,
    billingSameAsShipping:
      initialData.billingSameAsShipping !== undefined
        ? initialData.billingSameAsShipping
        : true,
    billingAddress: initialData.billingAddress || "",
    billingCity: initialData.billingCity || "",
    billingState: initialData.billingState || "",
    billingZipCode: initialData.billingZipCode || "",
    notes: initialData.notes || "",
    agreeToTerms: initialData.agreeToTerms || false,
    receiveUpdates: initialData.receiveUpdates || false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutFormData, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    // Personal Information Validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    // Shipping Address Validation
    if (!formData.address.trim())
      newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

    // Payment Validation
    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber?.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }

      if (!formData.cardName?.trim())
        newErrors.cardName = "Name on card is required";

      if (!formData.expiryDate?.trim()) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = "Please use MM/YY format";
      }

      if (!formData.cvv?.trim()) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = "Please enter a valid CVV";
      }
    }

    // Billing Address Validation
    if (!formData.billingSameAsShipping) {
      if (!formData.billingAddress?.trim())
        newErrors.billingAddress = "Billing address is required";
      if (!formData.billingCity?.trim())
        newErrors.billingCity = "City is required";
      if (!formData.billingState?.trim())
        newErrors.billingState = "State is required";
      if (!formData.billingZipCode?.trim())
        newErrors.billingZipCode = "ZIP code is required";
    }

    // Terms Validation
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error("Please fix the errors before continuing");
      // Scroll to first error
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  // Format expiry date
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setFormData((prev) => ({ ...prev, expiryDate: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
        <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6 flex items-center gap-2">
          <User size={20} className="text-[#C17B4D]" />
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.firstName
                  ? "border-[#C17B7B]"
                  : "border-[#E8E0D8] dark:border-gray-700"
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-[#C17B7B] error-message">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.lastName
                  ? "border-[#C17B7B]"
                  : "border-[#E8E0D8] dark:border-gray-700"
              } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-[#C17B7B] error-message">
                {errors.lastName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
                size={18}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  errors.email
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-[#C17B7B] error-message">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
                size={18}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  errors.phone
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-[#C17B7B] error-message">
                {errors.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
        <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6 flex items-center gap-2">
          <Truck size={20} className="text-[#C17B4D]" />
          Shipping Address
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
              Street Address *
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
                size={18}
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  errors.address
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-[#C17B7B] error-message">
                {errors.address}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
              Apartment, Suite, etc. (Optional)
            </label>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.city
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-[#C17B7B] error-message">
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.state
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-[#C17B7B] error-message">
                  {errors.state}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.zipCode
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-[#C17B7B] error-message">
                  {errors.zipCode}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
              Country *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all"
            >
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
        <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6 flex items-center gap-2">
          <CreditCard size={20} className="text-[#C17B4D]" />
          Payment Information
        </h2>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.paymentMethod === method.id
                  ? "border-[#C17B4D] bg-[#C17B4D]/10"
                  : "border-[#E8E0D8] dark:border-gray-700 hover:border-[#C17B4D]/50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={formData.paymentMethod === method.id}
                onChange={handleChange}
                className="hidden"
              />
              <span className="text-2xl">{method.icon}</span>
              <div>
                <div className="font-medium text-[#2C2C2C] dark:text-white">
                  {method.name}
                </div>
                <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                  {method.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Card Details */}
        {formData.paymentMethod === "card" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.cardNumber
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-[#C17B7B] error-message">
                  {errors.cardNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                Name on Card *
              </label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.cardName
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
              {errors.cardName && (
                <p className="mt-1 text-sm text-[#C17B7B] error-message">
                  {errors.cardName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                  Expiry Date *
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
                    size={18}
                  />
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                      errors.expiryDate
                        ? "border-[#C17B7B]"
                        : "border-[#E8E0D8] dark:border-gray-700"
                    } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
                  />
                </div>
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-[#C17B7B] error-message">
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                  CVV *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
                    size={18}
                  />
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                      errors.cvv
                        ? "border-[#C17B7B]"
                        : "border-[#E8E0D8] dark:border-gray-700"
                    } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
                  />
                </div>
                {errors.cvv && (
                  <p className="mt-1 text-sm text-[#C17B7B] error-message">
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="saveCard"
                checked={formData.saveCard}
                onChange={handleChange}
                className="h-5 w-5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
              />
              <span className="text-sm text-[#2C2C2C] dark:text-gray-300">
                Save card for future purchases
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Billing Address Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white flex items-center gap-2">
            <MapPin size={20} className="text-[#C17B4D]" />
            Billing Address
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="billingSameAsShipping"
              checked={formData.billingSameAsShipping}
              onChange={handleChange}
              className="h-5 w-5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
            />
            <span className="text-sm text-[#2C2C2C] dark:text-gray-300">
              Same as shipping address
            </span>
          </label>
        </div>

        {!formData.billingSameAsShipping && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                Billing Address *
              </label>
              <input
                type="text"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.billingAddress
                    ? "border-[#C17B7B]"
                    : "border-[#E8E0D8] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
              />
              {errors.billingAddress && (
                <p className="mt-1 text-sm text-[#C17B7B] error-message">
                  {errors.billingAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="billingCity"
                  value={formData.billingCity}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.billingCity
                      ? "border-[#C17B7B]"
                      : "border-[#E8E0D8] dark:border-gray-700"
                  } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
                />
                {errors.billingCity && (
                  <p className="mt-1 text-sm text-[#C17B7B] error-message">
                    {errors.billingCity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="billingState"
                  value={formData.billingState}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.billingState
                      ? "border-[#C17B7B]"
                      : "border-[#E8E0D8] dark:border-gray-700"
                  } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
                />
                {errors.billingState && (
                  <p className="mt-1 text-sm text-[#C17B7B] error-message">
                    {errors.billingState}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="billingZipCode"
                  value={formData.billingZipCode}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.billingZipCode
                      ? "border-[#C17B7B]"
                      : "border-[#E8E0D8] dark:border-gray-700"
                  } bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] transition-all`}
                />
                {errors.billingZipCode && (
                  <p className="mt-1 text-sm text-[#C17B7B] error-message">
                    {errors.billingZipCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
        <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6">
          Additional Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
            Order Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Special delivery instructions, gift message, etc."
            className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] resize-none transition-all"
          />
        </div>
      </div>

      {/* Terms and Submit */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className={`h-5 w-5 mt-0.5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D] ${
                errors.agreeToTerms ? "border-[#C17B7B]" : ""
              }`}
            />
            <div>
              <span className="text-sm text-[#2C2C2C] dark:text-gray-300">
                I agree to the{" "}
                <a href="/terms" className="text-[#C17B4D] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-[#C17B4D] hover:underline">
                  Privacy Policy
                </a>
              </span>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-[#C17B7B] error-message">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="receiveUpdates"
              checked={formData.receiveUpdates}
              onChange={handleChange}
              className="h-5 w-5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
            />
            <span className="text-sm text-[#2C2C2C] dark:text-gray-300">
              Receive updates about new products and exclusive offers
            </span>
          </label>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-[#2C3E3E]/10 rounded-xl border border-[#2C3E3E]/20">
          <div className="flex items-start gap-3">
            <Lock className="text-[#2C3E3E] mt-0.5 shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-[#2C3E3E]">
                Secure Payment
              </p>
              <p className="text-xs text-[#2C3E3E]/80 mt-1">
                Your payment information is encrypted and secure. We never store
                your credit card details.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 text-lg mt-6 bg-[#2C3E3E] hover:bg-[#4A6B6B] transition-all"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Place Order
              <CheckCircle size={18} />
            </div>
          )}
        </Button>

        <p className="text-center text-xs text-[#6B6B6B] dark:text-gray-400 mt-4">
          By placing your order, you agree to our{" "}
          <a href="/terms" className="text-[#C17B4D] hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/returns" className="text-[#C17B4D] hover:underline">
            Return Policy
          </a>
        </p>
      </div>
    </form>
  );
}
