"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, San Francisco, CA 94107",
    bio: "Digital enthusiast and avid shopper. Love discovering unique products and great deals.",
  });
  const [tempData, setTempData] = useState(profileData);

  const handleEdit = () => {
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempData(profileData);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProfileData(tempData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTempData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            My Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your profile information and preferences
          </p>
        </div>

        {!isEditing ? (
          <Button onClick={handleEdit} className="gap-2">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X size={16} />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6">
            <div className="relative mx-auto w-32 h-32">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                alt="Profile"
                className="w-full h-full rounded-full border-4 border-white dark:border-gray-800"
              />
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>

            <div className="text-center mt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={tempData.name}
                    onChange={handleChange}
                    className="w-full text-center bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  profileData.name
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Premium Member
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Active
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Member since Jan 2024
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                12
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Orders
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                4.8
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Rating
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User size={20} />
                Personal Information
              </h3>

              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={tempData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white">
                      {profileData.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={tempData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white">
                      {profileData.phone}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin size={16} />
                    Shipping Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={tempData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white">
                      {profileData.address}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={tempData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white">
                      {profileData.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Preferences
              </h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Receive updates about orders and promotions
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 rounded"
                    defaultChecked
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      SMS Notifications
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Get order updates via text message
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Use dark theme across the site
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 rounded"
                    defaultChecked
                  />
                </label>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Account Security
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Password
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Last changed 2 months ago
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Two-Factor Authentication
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Add an extra layer of security
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Linked Accounts
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Google, Facebook
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t pt-8 mt-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-red-600 dark:text-red-400">
          Danger Zone
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
            <div>
              <div className="font-bold text-red-700 dark:text-red-300">
                Delete Account
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Permanently delete your account and all associated data
              </div>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
