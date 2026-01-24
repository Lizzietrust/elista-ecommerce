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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle
              className="text-green-600 dark:text-green-400"
              size={48}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Thank you for your purchase. We've sent a confirmation email to your
            inbox.
          </p>
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl p-6 inline-block">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              #{orderDetails.orderId}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Order Date: {orderDetails.date}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Timeline */}
          <div className="lg:col-span-2">
            {/* Order Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Status
              </h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                {/* Timeline Steps */}
                <div className="space-y-8 relative">
                  {orderSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = step.status === "completed";
                    const isCurrent = step.status === "current";

                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div
                          className={`h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                            isCompleted
                              ? "bg-green-100 dark:bg-green-900/30"
                              : isCurrent
                                ? "bg-blue-100 dark:bg-blue-900/30"
                                : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <Icon
                            className={
                              isCompleted
                                ? "text-green-600 dark:text-green-400"
                                : isCurrent
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-400 dark:text-gray-500"
                            }
                            size={24}
                          />
                        </div>

                        <div className="flex-1 pt-3">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-bold ${
                                isCompleted || isCurrent
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {step.label}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {step.date}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
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

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Truck
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Estimated Delivery: {orderDetails.estimatedDelivery}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      You will receive tracking information via email once your
                      order ships.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                What's Next?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start gap-4"
                >
                  <Download size={20} />
                  <div className="text-left">
                    <div className="font-medium">Download Invoice</div>
                    <div className="text-sm text-gray-500">
                      Get your order receipt
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start gap-4"
                >
                  <Share2 size={20} />
                  <div className="text-left">
                    <div className="font-medium">Share Order</div>
                    <div className="text-sm text-gray-500">
                      Share with friends
                    </div>
                  </div>
                </Button>

                <Link href="/track-order" className="block">
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-4 w-full"
                  >
                    <Truck size={20} />
                    <div className="text-left">
                      <div className="font-medium">Track Order</div>
                      <div className="text-sm text-gray-500">
                        Follow your shipment
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/account/orders" className="block">
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-4 w-full"
                  >
                    <Package size={20} />
                    <div className="text-left">
                      <div className="font-medium">View All Orders</div>
                      <div className="text-sm text-gray-500">
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Items ({orderDetails.items})
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      $179.98
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      $10.00
                    </span>
                  </div>
                  <div className="pt-4 border-t dark:border-gray-800">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ${orderDetails.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Shipping To
                </h2>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {orderDetails.shippingAddress.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Payment Method
                </h2>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      VISA
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {orderDetails.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Paid on {orderDetails.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link href="/" className="block w-full">
                  <Button className="w-full gap-2">
                    <Home size={16} />
                    Continue Shopping
                  </Button>
                </Link>
                <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-sm">
                  Questions about your order?{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
