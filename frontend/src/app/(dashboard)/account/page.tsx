"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  X,
  Shield,
  Bell,
  Moon,
  Sun,
  CreditCard,
  Heart,
  Package,
  Star,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    toast.success(isDarkMode ? "Light mode activated" : "Dark mode activated");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
            My Account
          </h1>
          <p className="text-foreground-muted mt-2">
            Manage your profile information and preferences
          </p>
        </div>

        {!isEditing ? (
          <Button
            onClick={handleEdit}
            className="gap-2 bg-primary hover:bg-primary-light text-primary-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <User size={18} />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2 border-border hover:bg-background-secondary text-foreground transition-all duration-300"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2 bg-accent hover:bg-accent-light text-accent-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Package,
            label: "Total Orders",
            value: "12",
            color: "primary",
          },
          { icon: Heart, label: "Wishlist", value: "8", color: "accent" },
          { icon: Star, label: "Reviews", value: "24", color: "success" },
          {
            icon: CreditCard,
            label: "Saved Cards",
            value: "3",
            color: "primary",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-accent/30"
          >
            <div
              className={`h-10 w-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center mb-3`}
            >
              <stat.icon className={`text-${stat.color}`} size={20} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <div className="text-sm text-foreground-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm sticky top-24">
            <div className="relative mx-auto w-32 h-32">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-accent/20 shadow-lg">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-accent text-accent-foreground p-2.5 rounded-full hover:bg-accent-light transition-all duration-300 shadow-lg hover:scale-105">
                  <Camera size={16} />
                </button>
              )}
            </div>

            <div className="text-center mt-6">
              <h2 className="text-xl font-bold font-serif text-foreground">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={tempData.name}
                    onChange={handleChange}
                    className="w-full text-center bg-transparent border-b-2 border-border focus:border-accent outline-none transition-colors px-2 py-1"
                  />
                ) : (
                  profileData.name
                )}
              </h2>
              <p className="text-foreground-muted mt-2 flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
                Premium Member
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-foreground-muted">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
                  Active
                </div>
                <div className="text-sm text-foreground-muted">
                  Member since Jan 2024
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-border/50 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-background-secondary transition-all duration-200 text-foreground hover:text-accent group">
                <Package
                  size={18}
                  className="text-foreground-muted group-hover:text-accent"
                />
                <span className="flex-1 text-left">My Orders</span>
                <span className="text-sm text-foreground-muted">12</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-background-secondary transition-all duration-200 text-foreground hover:text-accent group">
                <Heart
                  size={18}
                  className="text-foreground-muted group-hover:text-accent"
                />
                <span className="flex-1 text-left">Wishlist</span>
                <span className="text-sm text-foreground-muted">8</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-background-secondary transition-all duration-200 text-foreground hover:text-accent group">
                <CreditCard
                  size={18}
                  className="text-foreground-muted group-hover:text-accent"
                />
                <span className="flex-1 text-left">Payment Methods</span>
                <span className="text-sm text-foreground-muted">3</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-bold font-serif text-foreground mb-6 flex items-center gap-2">
              <User size={20} className="text-accent" />
              Personal Information
            </h3>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Mail size={16} className="text-foreground-muted" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={tempData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                  />
                ) : (
                  <div className="px-4 py-3 bg-background-secondary rounded-xl text-foreground border border-border/50">
                    {profileData.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Phone size={16} className="text-foreground-muted" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={tempData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                  />
                ) : (
                  <div className="px-4 py-3 bg-background-secondary rounded-xl text-foreground border border-border/50">
                    {profileData.phone}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <MapPin size={16} className="text-foreground-muted" />
                  Shipping Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={tempData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                  />
                ) : (
                  <div className="px-4 py-3 bg-background-secondary rounded-xl text-foreground border border-border/50">
                    {profileData.address}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={tempData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-background-secondary rounded-xl text-foreground border border-border/50">
                    {profileData.bio}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-bold font-serif text-foreground mb-6">
              Preferences
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-background-secondary/50 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Bell
                    size={18}
                    className="text-foreground-muted group-hover:text-accent transition-colors"
                  />
                  <div>
                    <div className="font-medium text-foreground">
                      Email Notifications
                    </div>
                    <div className="text-sm text-foreground-muted">
                      Receive updates about orders and promotions
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-accent rounded border-border focus:ring-accent focus:ring-offset-2 transition-all duration-200"
                  defaultChecked
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-background-secondary/50 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Bell
                    size={18}
                    className="text-foreground-muted group-hover:text-accent transition-colors"
                  />
                  <div>
                    <div className="font-medium text-foreground">
                      SMS Notifications
                    </div>
                    <div className="text-sm text-foreground-muted">
                      Get order updates via text message
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-accent rounded border-border focus:ring-accent focus:ring-offset-2 transition-all duration-200"
                />
              </label>

              <label
                onClick={toggleDarkMode}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-background-secondary/50 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon
                      size={18}
                      className="text-foreground-muted group-hover:text-accent transition-colors"
                    />
                  ) : (
                    <Sun
                      size={18}
                      className="text-foreground-muted group-hover:text-accent transition-colors"
                    />
                  )}
                  <div>
                    <div className="font-medium text-foreground">Dark Mode</div>
                    <div className="text-sm text-foreground-muted">
                      {isDarkMode
                        ? "Currently using dark theme"
                        : "Use dark theme across the site"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${isDarkMode ? "bg-accent" : "bg-border"}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all duration-300 transform ${isDarkMode ? "translate-x-6" : "translate-x-0.5"} mt-0.5 shadow-md`}
                  ></div>
                </div>
              </label>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-bold font-serif text-foreground mb-6 flex items-center gap-2">
              <Shield size={20} className="text-accent" />
              Account Security
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50 border border-border/50 hover:border-accent/30 transition-all duration-200">
                <div>
                  <div className="font-medium text-foreground">Password</div>
                  <div className="text-sm text-foreground-muted">
                    Last changed 2 months ago
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-accent hover:bg-accent/5 text-foreground hover:text-accent transition-all duration-200"
                >
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50 border border-border/50 hover:border-accent/30 transition-all duration-200">
                <div>
                  <div className="font-medium text-foreground">
                    Two-Factor Authentication
                  </div>
                  <div className="text-sm text-foreground-muted">
                    Add an extra layer of security
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-accent hover:bg-accent/5 text-foreground hover:text-accent transition-all duration-200"
                >
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50 border border-border/50 hover:border-accent/30 transition-all duration-200">
                <div>
                  <div className="font-medium text-foreground">
                    Linked Accounts
                  </div>
                  <div className="text-sm text-foreground-muted">
                    Google, Facebook
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-accent hover:bg-accent/5 text-foreground hover:text-accent transition-all duration-200"
                >
                  Manage
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-border pt-8 mt-8">
        <h3 className="text-lg font-bold text-destructive mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-xl border-2 border-destructive/20 bg-destructive/5 hover:border-destructive/40 transition-all duration-300 gap-4">
          <div>
            <div className="font-bold text-destructive">Delete Account</div>
            <div className="text-sm text-destructive/80">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </div>
          </div>
          <Button
            variant="destructive"
            className="bg-destructive hover:bg-destructive-light text-destructive-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 min-w-35"
          >
            <LogOut size={16} className="mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
