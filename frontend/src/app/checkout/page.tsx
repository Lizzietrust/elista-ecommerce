"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ChevronLeft,
  CreditCard,
  Truck,
  Shield,
  User,
  MapPin,
  Phone,
  Mail,
  Check,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/components/providers/cart-provider";
import { toast } from "react-hot-toast";

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

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Shipping",
    price: 4.99,
    time: "5-7 business days",
  },
  {
    id: "express",
    name: "Express Shipping",
    price: 9.99,
    time: "2-3 business days",
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    price: 19.99,
    time: "Next business day",
  },
  {
    id: "free",
    name: "Free Shipping",
    price: 0,
    time: "5-10 business days",
    minOrder: 50,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartContext();

  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: "card",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    saveCard: false,
  });

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  const cartItems = cart.items;
  const itemCount = cart.itemCount;
  const subtotal = cart.totalPrice;

  const shippingMethod =
    shippingMethods.find((m) => m.id === selectedShipping) ||
    shippingMethods[0];
  const shippingCost =
    subtotal >= (shippingMethod.minOrder || 0) ? 0 : shippingMethod.price;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setPaymentInfo((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setPaymentInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateShipping = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "zipCode",
    ];
    const emptyFields = requiredFields.filter(
      (field) => !shippingInfo[field as keyof typeof shippingInfo],
    );

    if (emptyFields.length > 0) {
      toast.error("Please fill in all required shipping information");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const validatePayment = () => {
    if (paymentInfo.method === "card") {
      if (
        !paymentInfo.cardNumber ||
        !paymentInfo.cardName ||
        !paymentInfo.expiry ||
        !paymentInfo.cvv
      ) {
        toast.error("Please fill in all card details");
        return false;
      }

      if (paymentInfo.cardNumber.replace(/\s/g, "").length !== 16) {
        toast.error("Please enter a valid 16-digit card number");
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiry)) {
        toast.error("Please enter expiry date in MM/YY format");
        return false;
      }

      if (paymentInfo.cvv.length !== 3) {
        toast.error("Please enter a valid 3-digit CVV");
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (activeStep === 1 && !validateShipping()) return;
    if (activeStep === 2 && !validatePayment()) return;

    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      handlePlaceOrder();
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      cart.clearCart();
      toast.success("Order placed successfully!");
      router.push("/order-confirmation");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-24 w-24 bg-[#F4EFEA] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="text-[#6B6B6B]" size={48} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] dark:text-white mb-3">
            Your cart is empty
          </h1>
          <p className="text-[#6B6B6B] dark:text-gray-400 mb-8">
            Add some items to your cart before checking out.
          </p>
          <Link href="/">
            <Button className="gap-2 bg-[#2C3E3E] hover:bg-[#4A6B6B]">
              <ChevronLeft size={16} />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] dark:bg-[#2C2C2C] py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-[#C17B4D] hover:text-[#D49A6A] transition-colors mb-4"
          >
            <ChevronLeft size={16} className="mr-2" />
            Back to cart
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] dark:text-white">
            Checkout
          </h1>
          <p className="text-[#6B6B6B] dark:text-gray-400 mt-2">
            Complete your purchase in a few simple steps
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:w-2/3">
            {/* Progress Steps */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-[#E8E0D8] dark:border-gray-800">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors ${
                        activeStep >= step
                          ? "bg-[#2C3E3E] border-[#2C3E3E] text-white"
                          : "border-[#E8E0D8] dark:border-gray-700 text-[#6B6B6B] dark:text-gray-500"
                      }`}
                    >
                      {activeStep > step ? <Check size={20} /> : step}
                    </div>
                    <span className="text-sm mt-2 font-medium text-[#2C2C2C] dark:text-gray-300">
                      {step === 1
                        ? "Shipping"
                        : step === 2
                          ? "Payment"
                          : "Review"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-[#F4EFEA] dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C17B4D] transition-all duration-300"
                  style={{ width: `${((activeStep - 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-[#E8E0D8] dark:border-gray-800">
              {/* Step 1: Shipping Information */}
              {activeStep === 1 && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-[#2C3E3E]/10 dark:bg-[#2C3E3E]/30 flex items-center justify-center">
                      <Truck
                        className="text-[#2C3E3E] dark:text-[#4A6B6B]"
                        size={20}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white">
                        Shipping Information
                      </h2>
                      <p className="text-[#6B6B6B] dark:text-gray-400">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
                        <User size={18} />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={shippingInfo.firstName}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={shippingInfo.lastName}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                            required
                          />
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
                              value={shippingInfo.email}
                              onChange={handleShippingChange}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
                              size={18}
                            />
                            <input
                              type="tel"
                              name="phone"
                              value={shippingInfo.phone}
                              onChange={handleShippingChange}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
                        <MapPin size={18} />
                        Shipping Address
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={shippingInfo.address}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={shippingInfo.city}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                              State *
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={shippingInfo.state}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                              ZIP Code *
                            </label>
                            <input
                              type="text"
                              name="zipCode"
                              value={shippingInfo.zipCode}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                            Country
                          </label>
                          <select
                            name="country"
                            value={shippingInfo.country}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                          >
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">
                              United Kingdom
                            </option>
                            <option value="Australia">Australia</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Japan">Japan</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Method */}
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                        Shipping Method
                      </h3>
                      <div className="space-y-3">
                        {shippingMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedShipping === method.id
                                ? "border-[#C17B4D] bg-[#C17B4D]/10"
                                : "border-[#E8E0D8] dark:border-gray-700 hover:border-[#C17B4D]/50"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                  selectedShipping === method.id
                                    ? "border-[#C17B4D] bg-[#C17B4D]"
                                    : "border-[#E8E0D8] dark:border-gray-600"
                                }`}
                              >
                                {selectedShipping === method.id && (
                                  <div className="h-2 w-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-[#2C2C2C] dark:text-white">
                                  {method.name}
                                </div>
                                <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                                  {method.time}
                                </div>
                                {method.minOrder &&
                                  subtotal < method.minOrder && (
                                    <div className="text-xs text-[#C17B4D] mt-1">
                                      Order ${method.minOrder} or more for free
                                      shipping
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#2C2C2C] dark:text-white">
                                {method.price === 0
                                  ? "FREE"
                                  : `$${method.price.toFixed(2)}`}
                              </div>
                              {method.minOrder &&
                                subtotal >= method.minOrder && (
                                  <div className="text-xs text-[#6B8E6B]">
                                    Qualifies for free shipping
                                  </div>
                                )}
                            </div>
                            <input
                              type="radio"
                              name="shipping"
                              value={method.id}
                              checked={selectedShipping === method.id}
                              onChange={(e) =>
                                setSelectedShipping(e.target.value)
                              }
                              className="hidden"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {activeStep === 2 && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-[#C17B4D]/10 dark:bg-[#C17B4D]/30 flex items-center justify-center">
                      <CreditCard className="text-[#C17B4D]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white">
                        Payment Information
                      </h2>
                      <p className="text-[#6B6B6B] dark:text-gray-400">
                        How would you like to pay?
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Payment Method Selection */}
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                        Payment Method
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentInfo.method === method.id
                                ? "border-[#C17B4D] bg-[#C17B4D]/10"
                                : "border-[#E8E0D8] dark:border-gray-700 hover:border-[#C17B4D]/50"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                  paymentInfo.method === method.id
                                    ? "border-[#C17B4D] bg-[#C17B4D]"
                                    : "border-[#E8E0D8] dark:border-gray-600"
                                }`}
                              >
                                {paymentInfo.method === method.id && (
                                  <div className="h-2 w-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{method.icon}</span>
                                <div>
                                  <div className="font-medium text-[#2C2C2C] dark:text-white">
                                    {method.name}
                                  </div>
                                  <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                                    {method.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="method"
                              value={method.id}
                              checked={paymentInfo.method === method.id}
                              onChange={handlePaymentChange}
                              className="hidden"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Card Details */}
                    {paymentInfo.method === "card" && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                            Card Number *
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={paymentInfo.cardNumber}
                            onChange={handlePaymentChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                            Name on Card *
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={paymentInfo.cardName}
                            onChange={handlePaymentChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                              Expiry Date *
                            </label>
                            <input
                              type="text"
                              name="expiry"
                              value={paymentInfo.expiry}
                              onChange={handlePaymentChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                              CVV *
                            </label>
                            <input
                              type="text"
                              name="cvv"
                              value={paymentInfo.cvv}
                              onChange={handlePaymentChange}
                              placeholder="123"
                              maxLength={3}
                              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                name="saveCard"
                                checked={paymentInfo.saveCard}
                                onChange={handlePaymentChange}
                                className="h-5 w-5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
                              />
                              <span className="text-sm text-[#2C2C2C] dark:text-gray-300">
                                Save card for future purchases
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Billing Address */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[#2C2C2C] dark:text-white">
                          Billing Address
                        </h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={billingSameAsShipping}
                            onChange={(e) =>
                              setBillingSameAsShipping(e.target.checked)
                            }
                            className="h-5 w-5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
                          />
                          <span className="text-sm text-[#2C2C2C] dark:text-gray-300">
                            Same as shipping address
                          </span>
                        </label>
                      </div>

                      {!billingSameAsShipping && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                              Billing Address
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                              placeholder="Enter billing address"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security Notice */}
                    <div className="p-4 bg-[#2C3E3E]/10 rounded-xl border border-[#2C3E3E]/20">
                      <div className="flex items-start gap-3">
                        <Shield
                          className="text-[#2C3E3E] mt-1 flex-shrink-0"
                          size={20}
                        />
                        <div>
                          <p className="text-sm text-[#2C3E3E] font-medium">
                            Secure Payment
                          </p>
                          <p className="text-xs text-[#2C3E3E]/80 mt-1">
                            Your payment information is encrypted and secure. We
                            never store your credit card details.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review Order */}
              {activeStep === 3 && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-[#6B8E6B]/10 dark:bg-[#6B8E6B]/30 flex items-center justify-center">
                      <Check className="text-[#6B8E6B]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white">
                        Review Your Order
                      </h2>
                      <p className="text-[#6B6B6B] dark:text-gray-400">
                        Please review your order before placing it
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Order Summary */}
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                        Order Summary
                      </h3>
                      <div className="bg-[#FDF8F5] dark:bg-gray-800 rounded-xl p-6 border border-[#E8E0D8]">
                        <div className="space-y-4">
                          {cartItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-3 border-b border-[#E8E0D8] dark:border-gray-700 last:border-0"
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-[#F4EFEA] dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">🛒</span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#2C2C2C] dark:text-white">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                                    Quantity: {item.quantity} × $
                                    {item.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-[#2C2C2C] dark:text-white">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                        Shipping Information
                      </h3>
                      <div className="bg-[#FDF8F5] dark:bg-gray-800 rounded-xl p-6 border border-[#E8E0D8]">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#6B6B6B] dark:text-gray-400">
                              Name
                            </span>
                            <span className="font-medium text-[#2C2C2C] dark:text-white">
                              {shippingInfo.firstName} {shippingInfo.lastName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B6B] dark:text-gray-400">
                              Address
                            </span>
                            <span className="font-medium text-[#2C2C2C] dark:text-white text-right">
                              {shippingInfo.address}
                              <br />
                              {shippingInfo.city}, {shippingInfo.state}{" "}
                              {shippingInfo.zipCode}
                              <br />
                              {shippingInfo.country}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B6B] dark:text-gray-400">
                              Email
                            </span>
                            <span className="font-medium text-[#2C2C2C] dark:text-white">
                              {shippingInfo.email}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B6B] dark:text-gray-400">
                              Phone
                            </span>
                            <span className="font-medium text-[#2C2C2C] dark:text-white">
                              {shippingInfo.phone || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B6B] dark:text-gray-400">
                              Shipping Method
                            </span>
                            <span className="font-medium text-[#2C2C2C] dark:text-white">
                              {
                                shippingMethods.find(
                                  (m) => m.id === selectedShipping,
                                )?.name
                              }{" "}
                              -{" "}
                              {shippingCost === 0
                                ? "FREE"
                                : `$${shippingCost.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                        Payment Information
                      </h3>
                      <div className="bg-[#FDF8F5] dark:bg-gray-800 rounded-xl p-6 border border-[#E8E0D8]">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#6B6B6B] dark:text-gray-400">
                              Payment Method
                            </span>
                            <span className="font-medium text-[#2C2C2C] dark:text-white">
                              {
                                paymentMethods.find(
                                  (m) => m.id === paymentInfo.method,
                                )?.name
                              }
                            </span>
                          </div>
                          {paymentInfo.method === "card" && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-[#6B6B6B] dark:text-gray-400">
                                  Card Number
                                </span>
                                <span className="font-medium text-[#2C2C2C] dark:text-white">
                                  **** **** ****{" "}
                                  {paymentInfo.cardNumber.slice(-4)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#6B6B6B] dark:text-gray-400">
                                  Name on Card
                                </span>
                                <span className="font-medium text-[#2C2C2C] dark:text-white">
                                  {paymentInfo.cardName}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="p-4 bg-[#C17B4D]/10 rounded-xl border border-[#C17B4D]/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className="text-[#C17B4D] mt-1 flex-shrink-0"
                          size={20}
                        />
                        <div>
                          <p className="text-sm font-medium text-[#2C2C2C] dark:text-white mb-2">
                            Important Information
                          </p>
                          <ul className="text-xs text-[#6B6B6B] dark:text-gray-400 space-y-1">
                            <li>
                              • Your order will be processed within 24 hours
                            </li>
                            <li>
                              • You will receive a confirmation email with
                              tracking information
                            </li>
                            <li>
                              • Returns are accepted within 30 days of delivery
                            </li>
                            <li>
                              • By placing this order, you agree to our Terms of
                              Service
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="p-6 md:p-8 border-t border-[#E8E0D8] dark:border-gray-800 bg-[#FDF8F5] dark:bg-gray-900/50">
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
                  {activeStep > 1 && (
                    <Button
                      onClick={handlePreviousStep}
                      variant="outline"
                      className="gap-2 border-[#E8E0D8] hover:bg-[#F4EFEA]"
                    >
                      <ChevronLeft size={16} />
                      Back
                    </Button>
                  )}

                  <Button
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="gap-2 ml-auto bg-[#2C3E3E] hover:bg-[#4A6B6B]"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : activeStep === 3 ? (
                      <>
                        <Lock size={16} />
                        Place Order
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-[#E8E0D8] dark:border-gray-800">
                <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6">
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-[#F4EFEA] dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🛒</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#2C2C2C] dark:text-white truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-[#2C2C2C] dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {cartItems.length > 3 && (
                    <div className="text-center pt-4 border-t border-[#E8E0D8] dark:border-gray-800">
                      <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                        +{cartItems.length - 3} more items
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium text-[#2C2C2C] dark:text-white">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Shipping
                    </span>
                    <span
                      className={`font-medium ${shippingCost === 0 ? "text-[#6B8E6B]" : "text-[#2C2C2C] dark:text-white"}`}
                    >
                      {shippingCost === 0
                        ? "FREE"
                        : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Tax
                    </span>
                    <span className="font-medium text-[#2C2C2C] dark:text-white">
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-[#E8E0D8] dark:border-gray-800">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[#2C2C2C] dark:text-white">
                        Total
                      </span>
                      <span className="text-[#2C2C2C] dark:text-white">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mt-1">
                      Including ${tax.toFixed(2)} in taxes
                    </p>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 px-4 py-2 rounded-lg border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap border-[#E8E0D8] hover:bg-[#F4EFEA]"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-4 text-sm text-[#6B6B6B] dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield size={16} />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="h-4 w-px bg-[#E8E0D8] dark:border-gray-700"></div>
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    <span>SSL Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Need Help Section */}
              <div className="bg-[#2C3E3E]/10 rounded-2xl p-6 border border-[#2C3E3E]/20">
                <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                  Need Help?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#2C3E3E]/20 flex items-center justify-center">
                      <span className="text-[#2C3E3E]">📞</span>
                    </div>
                    <div>
                      <div className="font-medium text-[#2C2C2C] dark:text-white">
                        Call Us
                      </div>
                      <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                        1-800-ELISTA
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#C17B4D]/20 flex items-center justify-center">
                      <span className="text-[#C17B4D]">💬</span>
                    </div>
                    <div>
                      <div className="font-medium text-[#2C2C2C] dark:text-white">
                        Live Chat
                      </div>
                      <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                        Available 24/7
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#6B8E6B]/20 flex items-center justify-center">
                      <span className="text-[#6B8E6B]">📧</span>
                    </div>
                    <div>
                      <div className="font-medium text-[#2C2C2C] dark:text-white">
                        Email
                      </div>
                      <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                        help@elista.com
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
