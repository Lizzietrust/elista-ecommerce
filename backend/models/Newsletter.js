import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      enum: ["newsletter_form", "checkout", "footer", "other"],
      default: "newsletter_form",
    },
    ipAddress: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  },
);

newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ subscribedAt: -1 });

newsletterSchema.methods.unsubscribe = async function () {
  this.status = "unsubscribed";
  this.unsubscribedAt = Date.now();
  await this.save();
  return this;
};

newsletterSchema.statics.findActiveSubscribers = function () {
  return this.find({ status: "subscribed" }).sort({ subscribedAt: -1 });
};

newsletterSchema.statics.isSubscribed = async function (email) {
  const subscriber = await this.findOne({
    email: email.toLowerCase(),
    status: "subscribed",
  });
  return !!subscriber;
};

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;
