"use client";

import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmationPage() {
  const orderDetails = {
    orderId: "ORD-789456123",
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    estimatedDelivery: "December 24, 2024",
    items: 3,
    total: 189.97,
    shippingAddress: {
      name: "John Doe",
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
      country: "United States",
    },
    paymentMethod: "Visa ending in 4242",
  };

  const orderSteps = [
    {
      icon: Package,
      label: "Order Confirmed",
      status: "completed",
      date: "Today",
    },
    {
      icon: Package,
      label: "Order Processed",
      status: "current",
      date: "Tomorrow",
    },
    { icon: Truck, label: "Shipped", status: "upcoming", date: "Dec 22" },
    {
      icon: CheckCircle,
      label: "Delivered",
      status: "upcoming",
      date: "Dec 24",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F5] dark:bg-[#2C2C2C] py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="h-24 w-24 bg-[#6B8E6B]/10 dark:bg-[#6B8E6B]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle
              className="text-[#6B8E6B] dark:text-[#8BAA8B]"
              size={48}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] dark:text-white mb-4">
            Order Confirmed!
          </h1>
          <p className="text-[#6B6B6B] dark:text-gray-400 text-lg">
            Thank you for your purchase. We've sent a confirmation email to your
            inbox.
          </p>
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl p-6 inline-block border border-[#E8E0D8] dark:border-gray-800 shadow-lg">
            <div className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
              #{orderDetails.orderId}
            </div>
            <div className="text-[#6B6B6B] dark:text-gray-400">
              Order Date: {orderDetails.date}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Timeline */}
          <div className="lg:col-span-2">
            {/* Order Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-[#E8E0D8] dark:border-gray-800">
              <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6">
                Order Status
              </h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#E8E0D8] dark:bg-gray-800"></div>

                {/* Timeline Steps */}
                <div className="space-y-8 relative">
                  {orderSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = step.status === "completed";
                    const isCurrent = step.status === "current";

                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div
                          className={`h-16 w-16 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                            isCompleted
                              ? "bg-[#6B8E6B]/10 dark:bg-[#6B8E6B]/30"
                              : isCurrent
                                ? "bg-[#C17B4D]/10 dark:bg-[#C17B4D]/30"
                                : "bg-[#F4EFEA] dark:bg-gray-800"
                          }`}
                        >
                          <Icon
                            className={
                              isCompleted
                                ? "text-[#6B8E6B] dark:text-[#8BAA8B]"
                                : isCurrent
                                  ? "text-[#C17B4D] dark:text-[#D49A6A]"
                                  : "text-[#6B6B6B] dark:text-gray-500"
                            }
                            size={24}
                          />
                        </div>

                        <div className="flex-1 pt-3">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-bold ${
                                isCompleted || isCurrent
                                  ? "text-[#2C2C2C] dark:text-white"
                                  : "text-[#6B6B6B] dark:text-gray-400"
                              }`}
                            >
                              {step.label}
                            </h3>
                            <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                              {step.date}
                            </span>
                          </div>
                          <p className="text-[#6B6B6B] dark:text-gray-400 text-sm">
                            {isCompleted &&
                              "Your order has been confirmed and is being processed."}
                            {isCurrent &&
                              "We are preparing your order for shipment."}
                            {step.status === "upcoming" &&
                              "Your order will reach this stage soon."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#2C3E3E]/10 rounded-xl border border-[#2C3E3E]/20">
                <div className="flex items-center gap-3">
                  <Truck className="text-[#2C3E3E]" size={20} />
                  <div>
                    <p className="text-sm font-medium text-[#2C3E3E]">
                      Estimated Delivery: {orderDetails.estimatedDelivery}
                    </p>
                    <p className="text-xs text-[#2C3E3E]/80 mt-1">
                      You will receive tracking information via email once your
                      order ships.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-[#E8E0D8] dark:border-gray-800">
              <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6">
                What's Next?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start gap-4 border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D] transition-all"
                >
                  <Download size={20} className="text-[#C17B4D]" />
                  <div className="text-left">
                    <div className="font-medium text-[#2C2C2C] dark:text-white">
                      Download Invoice
                    </div>
                    <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Get your order receipt
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start gap-4 border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D] transition-all"
                >
                  <Share2 size={20} className="text-[#C17B4D]" />
                  <div className="text-left">
                    <div className="font-medium text-[#2C2C2C] dark:text-white">
                      Share Order
                    </div>
                    <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Share with friends
                    </div>
                  </div>
                </Button>

                <Link href="/track-order" className="block">
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-4 w-full border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D] transition-all"
                  >
                    <Truck size={20} className="text-[#C17B4D]" />
                    <div className="text-left">
                      <div className="font-medium text-[#2C2C2C] dark:text-white">
                        Track Order
                      </div>
                      <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                        Follow your shipment
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/account/orders" className="block">
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-4 w-full border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D] transition-all"
                  >
                    <Package size={20} className="text-[#C17B4D]" />
                    <div className="text-left">
                      <div className="font-medium text-[#2C2C2C] dark:text-white">
                        View All Orders
                      </div>
                      <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                        In your account
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-[#E8E0D8] dark:border-gray-800">
                <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Items ({orderDetails.items})
                    </span>
                    <span className="font-medium text-[#2C2C2C] dark:text-white">
                      $179.98
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="font-medium text-[#6B8E6B]">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Tax
                    </span>
                    <span className="font-medium text-[#2C2C2C] dark:text-white">
                      $10.00
                    </span>
                  </div>
                  <div className="pt-4 border-t border-[#E8E0D8] dark:border-gray-800">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[#2C2C2C] dark:text-white">
                        Total
                      </span>
                      <span className="text-[#2C2C2C] dark:text-white">
                        ${orderDetails.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-[#E8E0D8] dark:border-gray-800">
                <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4">
                  Shipping To
                </h2>
                <div className="space-y-2">
                  <p className="font-medium text-[#2C2C2C] dark:text-white">
                    {orderDetails.shippingAddress.name}
                  </p>
                  <p className="text-[#6B6B6B] dark:text-gray-400">
                    {orderDetails.shippingAddress.street}
                    <br />
                    {orderDetails.shippingAddress.city},{" "}
                    {orderDetails.shippingAddress.state}{" "}
                    {orderDetails.shippingAddress.zip}
                    <br />
                    {orderDetails.shippingAddress.country}
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-[#E8E0D8] dark:border-gray-800">
                <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4">
                  Payment Method
                </h2>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
                    <span className="font-bold text-[#2C2C2C] dark:text-gray-300">
                      VISA
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#2C2C2C] dark:text-white">
                      {orderDetails.paymentMethod}
                    </p>
                    <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Paid on {orderDetails.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link href="/" className="block w-full">
                  <Button className="w-full gap-2 bg-[#2C3E3E] hover:bg-[#4A6B6B] transition-all">
                    <Home size={16} />
                    Continue Shopping
                  </Button>
                </Link>
                <p className="text-center text-[#6B6B6B] dark:text-gray-400 mt-4 text-sm">
                  Questions about your order?{" "}
                  <Link
                    href="/contact"
                    className="text-[#C17B4D] hover:text-[#D49A6A] transition-colors"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-12 pt-8 border-t border-[#E8E0D8] dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-[#2C3E3E]/10 flex items-center justify-center mx-auto mb-3">
                <Package className="text-[#2C3E3E]" size={20} />
              </div>
              <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-1">
                Need Help?
              </h3>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                Contact our support team
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-[#C17B4D]/10 flex items-center justify-center mx-auto mb-3">
                <Truck className="text-[#C17B4D]" size={20} />
              </div>
              <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-1">
                Track Your Order
              </h3>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                Get real-time updates
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-[#6B8E6B]/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="text-[#6B8E6B]" size={20} />
              </div>
              <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-1">
                Easy Returns
              </h3>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                30-day return policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
