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
          <h1 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] dark:text-white">
            My Account
          </h1>
          <p className="text-[#6B6B6B] dark:text-gray-400 mt-2">
            Manage your profile information and preferences
          </p>
        </div>

        {!isEditing ? (
          <Button
            onClick={handleEdit}
            className="gap-2 bg-[#2C3E3E] hover:bg-[#4A6B6B]"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2 border-[#E8E0D8] hover:bg-[#F4EFEA]"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2 bg-[#C17B4D] hover:bg-[#D49A6A]"
            >
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
          <div className="bg-linear-to-br from-[#F4EFEA] to-[#E8E0D8] dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-[#E8E0D8] dark:border-gray-700">
            <div className="relative mx-auto w-32 h-32">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                alt="Profile"
                className="w-full h-full rounded-full border-4 border-white dark:border-gray-800"
              />
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-[#C17B4D] text-white p-2 rounded-full hover:bg-[#D49A6A] transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>

            <div className="text-center mt-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={tempData.name}
                    onChange={handleChange}
                    className="w-full text-center bg-transparent border-b border-[#E8E0D8] focus:outline-none focus:border-[#C17B4D]"
                  />
                ) : (
                  profileData.name
                )}
              </h2>
              <p className="text-[#6B6B6B] dark:text-gray-400 mt-2">
                Premium Member
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-[#6B8E6B]"></div>
                  <span className="text-[#6B6B6B] dark:text-gray-400">
                    Active
                  </span>
                </div>
                <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                  Member since Jan 2024
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-[#E8E0D8]">
              <div className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                12
              </div>
              <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                Orders
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-[#E8E0D8]">
              <div className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                4.8
              </div>
              <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                Avg Rating
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E8E0D8]">
              <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-[#C17B4D]" />
                Personal Information
              </h3>

              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={tempData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] bg-[#FDF8F5] dark:bg-gray-900 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-[#FDF8F5] dark:bg-gray-900 rounded-xl text-[#2C2C2C] dark:text-white border border-[#E8E0D8]">
                      {profileData.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={tempData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] bg-[#FDF8F5] dark:bg-gray-900 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-[#FDF8F5] dark:bg-gray-900 rounded-xl text-[#2C2C2C] dark:text-white border border-[#E8E0D8]">
                      {profileData.phone}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                    <MapPin size={16} />
                    Shipping Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={tempData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] bg-[#FDF8F5] dark:bg-gray-900 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-[#FDF8F5] dark:bg-gray-900 rounded-xl text-[#2C2C2C] dark:text-white border border-[#E8E0D8]">
                      {profileData.address}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={tempData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E0D8] bg-[#FDF8F5] dark:bg-gray-900 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] resize-none"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-[#FDF8F5] dark:bg-gray-900 rounded-xl text-[#2C2C2C] dark:text-white border border-[#E8E0D8]">
                      {profileData.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E8E0D8]">
              <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white mb-6">
                Preferences
              </h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-[#E8E0D8] hover:bg-[#F4EFEA] dark:hover:bg-gray-900 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-[#2C2C2C] dark:text-white">
                      Email Notifications
                    </div>
                    <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Receive updates about orders and promotions
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
                    defaultChecked
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-[#E8E0D8] hover:bg-[#F4EFEA] dark:hover:bg-gray-900 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-[#2C2C2C] dark:text-white">
                      SMS Notifications
                    </div>
                    <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Get order updates via text message
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-[#E8E0D8] hover:bg-[#F4EFEA] dark:hover:bg-gray-900 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-[#2C2C2C] dark:text-white">
                      Dark Mode
                    </div>
                    <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Use dark theme across the site
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-[#C17B4D] rounded border-[#E8E0D8] focus:ring-[#C17B4D]"
                    defaultChecked
                  />
                </label>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E8E0D8]">
              <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white mb-6">
                Account Security
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#FDF8F5] dark:bg-gray-900 border border-[#E8E0D8]">
                  <div>
                    <div className="font-medium text-[#2C2C2C] dark:text-white">
                      Password
                    </div>
                    <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Last changed 2 months ago
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E8E0D8] hover:bg-[#F4EFEA]"
                  >
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#FDF8F5] dark:bg-gray-900 border border-[#E8E0D8]">
                  <div>
                    <div className="font-medium text-[#2C2C2C] dark:text-white">
                      Two-Factor Authentication
                    </div>
                    <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Add an extra layer of security
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E8E0D8] hover:bg-[#F4EFEA]"
                  >
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#FDF8F5] dark:bg-gray-900 border border-[#E8E0D8]">
                  <div>
                    <div className="font-medium text-[#2C2C2C] dark:text-white">
                      Linked Accounts
                    </div>
                    <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Google, Facebook
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E8E0D8] hover:bg-[#F4EFEA]"
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t pt-8 mt-8 border-[#E8E0D8]">
        <h3 className="text-lg font-bold text-[#C17B7B] mb-6">Danger Zone</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 rounded-xl border border-[#C17B7B]/30 bg-[#C17B7B]/5">
            <div>
              <div className="font-bold text-[#C17B7B]">Delete Account</div>
              <div className="text-sm text-[#C17B7B]/80">
                Permanently delete your account and all associated data
              </div>
            </div>
            <Button
              variant="destructive"
              className="bg-[#C17B7B] hover:bg-[#A05E5E]"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
