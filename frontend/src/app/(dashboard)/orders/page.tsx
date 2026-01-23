"use client";

import { useState } from "react";
import {
  Package,
  CheckCircle,
  Truck,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const orders = [
  {
    id: "ORD-789456",
    date: "2024-01-15",
    status: "delivered",
    statusText: "Delivered",
    items: 3,
    total: 245.99,
    itemsList: [
      { name: "Wireless Headphones", quantity: 1, price: 129.99 },
      { name: "Phone Case", quantity: 2, price: 58.0 },
    ],
  },
  {
    id: "ORD-789457",
    date: "2024-01-10",
    status: "shipped",
    statusText: "Shipped",
    items: 2,
    total: 89.99,
    itemsList: [{ name: "T-Shirt", quantity: 2, price: 39.99 }],
  },
  {
    id: "ORD-789458",
    date: "2024-01-05",
    status: "processing",
    statusText: "Processing",
    items: 1,
    total: 45.5,
    itemsList: [{ name: "Coffee Mug", quantity: 1, price: 24.99 }],
  },
  {
    id: "ORD-789459",
    date: "2024-01-02",
    status: "pending",
    statusText: "Pending",
    items: 4,
    total: 189.75,
    itemsList: [
      { name: "Laptop Stand", quantity: 1, price: 89.99 },
      { name: "USB Cable", quantity: 3, price: 33.0 },
    ],
  },
];

const statusConfig = {
  delivered: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
  },
  shipped: {
    icon: Truck,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  processing: {
    icon: Clock,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  pending: {
    icon: Clock,
    color: "text-gray-600 bg-gray-100 dark:bg-gray-900/30",
    border: "border-gray-200 dark:border-gray-800",
  },
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.itemsList.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          My Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track, return, or buy things again
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                12
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Orders
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                8
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Delivered
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle
                className="text-green-600 dark:text-green-400"
                size={24}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                2
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                In Transit
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Truck className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                $1,245
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Spent
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-xl">
                💰
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search orders by ID or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "Try a different search term"
                : "You haven't placed any orders yet"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon =
              statusConfig[order.status as keyof typeof statusConfig].icon;
            const statusColor =
              statusConfig[order.status as keyof typeof statusConfig].color;
            const statusBorder =
              statusConfig[order.status as keyof typeof statusConfig].border;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {order.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor} ${statusBorder}`}
                        >
                          <StatusIcon size={14} className="inline mr-1" />
                          {order.statusText}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Placed on{" "}
                        {new Date(order.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.items} {order.items === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.itemsList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.quantity} • $
                              {item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2">
                      <Eye size={16} />
                      View Details
                    </Button>
                    <Button variant="outline" className="gap-2">
                      Track Order
                    </Button>
                    {order.status === "delivered" && (
                      <Button variant="outline" className="gap-2">
                        Return Items
                      </Button>
                    )}
                    <Button className="ml-auto gap-2">Buy Again</Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h3>

        <div className="space-y-4">
          {[
            { text: "Order ORD-789456 was delivered", time: "2 hours ago" },
            { text: "Order ORD-789457 was shipped", time: "1 day ago" },
            {
              text: 'You left a review for "Wireless Headphones"',
              time: "3 days ago",
            },
            { text: "Payment method updated", time: "1 week ago" },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  {activity.text}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
