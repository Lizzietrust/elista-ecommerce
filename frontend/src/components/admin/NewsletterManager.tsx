"use client";

import { useState } from "react";
import {
  useAllSubscribers,
  useSubscriberCount,
  useSubscriptionStats,
  useExportSubscribersCSV,
  useSendBulkNewsletter,
  useDeleteSubscriber,
} from "@/lib/hooks/use-newsletter";
import type { NewsletterSubscriber } from "@/lib/api/newsletter";

interface SubscriptionStats {
  totals: {
    all: number;
    active: number;
    unsubscribed: number;
  };
  newSubscriptions: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  sources: Record<string, number>;
}

interface SubscriberCount {
  active: number;
  total: number;
  newThisMonth: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function NewsletterManager() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"subscribed" | "unsubscribed" | "all">(
    "subscribed",
  );
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<"html" | "text">("html");

  const { data: subscribersData, isLoading: isLoadingSubscribers } =
    useAllSubscribers({ page, limit: 20, status }) as {
      data: PaginatedResponse<NewsletterSubscriber> | undefined;
      isLoading: boolean;
    };

  const { data: stats, isLoading: isLoadingStats } = useSubscriptionStats() as {
    data: SubscriptionStats | undefined;
    isLoading: boolean;
  };

  const { data: count, isLoading: isLoadingCount } = useSubscriberCount() as {
    data: SubscriberCount | undefined;
    isLoading: boolean;
  };

  const { mutate: exportCSV, isPending: isExporting } =
    useExportSubscribersCSV();
  const { mutate: sendNewsletter, isPending: isSending } =
    useSendBulkNewsletter();
  const { mutate: deleteSubscriber } = useDeleteSubscriber();

  const handleSendNewsletter = () => {
    if (!subject || !content) {
      alert("Please fill in subject and content");
      return;
    }
    sendNewsletter({ subject, content, contentType });
  };

  if (isLoadingStats || isLoadingCount) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">
        Newsletter Management
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm text-gray-500 font-medium">
            Active Subscribers
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.totals.active || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm text-gray-500 font-medium">
            Total Subscribers
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.totals.all || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm text-gray-500 font-medium">New This Month</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.newSubscriptions.thisMonth || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm text-gray-500 font-medium">Unsubscribed</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.totals.unsubscribed || 0}
          </p>
        </div>
      </div>

      {/* Send Newsletter Section */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Send Newsletter
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Newsletter subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) =>
                setContentType(e.target.value as "html" | "text")
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="html">HTML</option>
              <option value="text">Plain Text</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                contentType === "html"
                  ? "<p>Your HTML content here...</p>"
                  : "Your plain text content..."
              }
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSendNewsletter}
              disabled={isSending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {isSending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Sending...
                </>
              ) : (
                `Send to ${count?.active || 0} Subscribers`
              )}
            </button>
            <button
              onClick={() => exportCSV()}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
            >
              {isExporting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Exporting...
                </>
              ) : (
                "Export CSV"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Subscribers</h2>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "subscribed" | "unsubscribed" | "all")
            }
            className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="subscribed">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Source
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Subscribed At
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingSubscribers ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">
                        Loading subscribers...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : subscribersData?.data && subscribersData.data.length > 0 ? (
                subscribersData.data.map((subscriber: NewsletterSubscriber) => (
                  <tr
                    key={subscriber._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.status === "subscribed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {subscriber.source}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this subscriber?",
                            )
                          ) {
                            deleteSubscriber(subscriber._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No subscribers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {subscribersData?.pagination &&
          subscribersData.pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {subscribersData.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === subscribersData.pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
