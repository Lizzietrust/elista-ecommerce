import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["flash_sale", "seasonal", "clearance", "holiday", "new_arrival"],
      default: "flash_sale",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    eligibleProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    eligibleCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applyToAll: {
      type: Boolean,
      default: false,
    },
    minimumPurchase: {
      type: Number,
      default: 0,
    },
    maximumDiscount: {
      type: Number,
    },
    bannerText: {
      type: String,
    },
    bannerColor: {
      type: String,
      default: "#FF6B6B",
    },
    priority: {
      type: Number,
      default: 0,
    },
    displayOnHomepage: {
      type: Boolean,
      default: true,
    },
    displayOnProductPage: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

campaignSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

campaignSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

campaignSchema.methods.getTimeRemaining = function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { days, hours, minutes, seconds };
};

campaignSchema.statics.getActiveCampaigns = async function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort("-priority");
};

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
