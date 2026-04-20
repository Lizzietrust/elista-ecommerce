"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../providers/auth-provider";
import { apiClient } from "@/lib/api/client";

interface Campaign {
  _id: string;
  name: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  displayOnHomepage: boolean;
  bannerText?: string;
  bannerColor?: string;
  displayOnProductPage?: boolean;
}

export default function AdminCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    discountType: "percentage",
    discountValue: 20,
    startDate: "",
    endDate: "",
    isActive: true,
    displayOnHomepage: true,
    displayOnProductPage: true,
    bannerText: "",
    bannerColor: "#FF6B6B",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);

      const response = await apiClient.get("/campaigns");
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/campaigns", formData);
      setIsModalOpen(false);
      fetchCampaigns();
      resetForm();
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      discountType: "percentage",
      discountValue: 20,
      startDate: "",
      endDate: "",
      isActive: true,
      displayOnHomepage: true,
      displayOnProductPage: true,
      bannerText: "",
      bannerColor: "#FF6B6B",
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await apiClient.delete(`/campaigns/${id}`);
        fetchCampaigns();
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.put(`/campaigns/${id}`, { isActive: !currentStatus });
      fetchCampaigns();
    } catch (error) {
      console.error("Error toggling campaign:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          + New Campaign
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign._id}>
                <td className="px-6 py-4">{campaign.name}</td>
                <td className="px-6 py-4">
                  {campaign.discountType === "percentage"
                    ? `${campaign.discountValue}% OFF`
                    : `$${campaign.discountValue} OFF`}
                </td>
                <td className="px-6 py-4">
                  {new Date(campaign.startDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {new Date(campaign.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      handleToggleActive(campaign._id, campaign.isActive)
                    }
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      campaign.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(campaign._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Campaign</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Black Friday Sale"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={
                      formData.discountType === "percentage" ? "100" : undefined
                    }
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Banner Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.bannerText}
                    onChange={(e) =>
                      setFormData({ ...formData, bannerText: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Limited time offer!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Banner Color
                  </label>
                  <input
                    type="color"
                    value={formData.bannerColor}
                    onChange={(e) =>
                      setFormData({ ...formData, bannerColor: e.target.value })
                    }
                    className="w-full h-10 border rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="displayHomepage"
                    checked={formData.displayOnHomepage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOnHomepage: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="displayHomepage">Display on Homepage</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="displayProduct"
                    checked={formData.displayOnProductPage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOnProductPage: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="displayProduct">
                    Display on Product Pages
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
