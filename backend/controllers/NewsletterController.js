import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import Newsletter from "../models/Newsletter.js";
import {
  sendWelcomeEmail,
  sendWelcomeBackEmail,
  sendUnsubscribeConfirmation,
} from "../utils/sendEmail.js";

export const subscribeToNewsletter = asyncHandler(async (req, res, next) => {
  const { email, source = "newsletter_form", name = "" } = req.body;

  if (!email) {
    return next(new ErrorResponse("Email is required", 400));
  }

  let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  let isResubscription = false;

  if (subscriber) {
    if (subscriber.status === "subscribed") {
      return next(new ErrorResponse("Email already subscribed", 400));
    } else if (subscriber.status === "unsubscribed") {
      subscriber.status = "subscribed";
      subscriber.unsubscribedAt = null;
      subscriber.subscribedAt = Date.now();
      subscriber.source = source;
      subscriber.ipAddress = req.ip || req.connection.remoteAddress;
      await subscriber.save();
      isResubscription = true;

      try {
        await sendWelcomeBackEmail(email, name);
        console.log(`Welcome back email sent to ${email}`);
      } catch (emailError) {
        console.error("Failed to send welcome back email:", emailError.message);
      }

      return res.status(200).json({
        success: true,
        message: "Successfully resubscribed to newsletter",
        data: {
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt,
          isResubscription: true,
        },
      });
    }
  }

  subscriber = await Newsletter.create({
    email: email.toLowerCase(),
    source,
    ipAddress: req.ip || req.connection.remoteAddress,
  });

  try {
    await sendWelcomeEmail(email, name);
    console.log(`Welcome email sent to ${email}`);
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError.message);
  }

  res.status(201).json({
    success: true,
    message: "Successfully subscribed to newsletter",
    data: {
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt,
      isResubscription: false,
    },
  });
});

export const unsubscribeFromNewsletter = asyncHandler(
  async (req, res, next) => {
    const { email } = req.body;
    const { token } = req.params;

    let targetEmail = email;

    if (token) {
      const subscriber = await Newsletter.findOne({
        unsubscribeToken: token,
        status: "subscribed",
      });
      if (subscriber) {
        targetEmail = subscriber.email;
      }
    }

    if (!targetEmail) {
      return next(new ErrorResponse("Email or token required", 400));
    }

    const subscriber = await Newsletter.findOne({
      email: targetEmail.toLowerCase(),
      status: "subscribed",
    });

    if (!subscriber) {
      return next(
        new ErrorResponse("Subscriber not found or already unsubscribed", 404),
      );
    }

    await subscriber.unsubscribe();

    try {
      await sendUnsubscribeConfirmation(targetEmail);
      console.log(`Unsubscribe confirmation sent to ${targetEmail}`);
    } catch (emailError) {
      console.error(
        "Failed to send unsubscribe confirmation:",
        emailError.message,
      );
    }

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  },
);

export const getAllSubscribers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status = "subscribed" } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const query = status === "all" ? {} : { status };

  const subscribers = await Newsletter.find(query)
    .sort({ subscribedAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .select("-__v");

  const total = await Newsletter.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      subscribers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getSubscriberCount = asyncHandler(async (req, res, next) => {
  const activeCount = await Newsletter.countDocuments({ status: "subscribed" });
  const totalCount = await Newsletter.countDocuments();
  const newThisMonth = await Newsletter.countDocuments({
    subscribedAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
  });

  res.status(200).json({
    success: true,
    data: {
      active: activeCount,
      total: totalCount,
      newThisMonth,
    },
  });
});

export const exportSubscribersCSV = asyncHandler(async (req, res, next) => {
  const subscribers = await Newsletter.find({ status: "subscribed" })
    .select("email subscribedAt source -_id")
    .sort({ subscribedAt: -1 });

  let csv = "Email,Subscribed Date,Source\n";
  subscribers.forEach((sub) => {
    csv += `${sub.email},${sub.subscribedAt.toISOString()},${sub.source}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=subscribers.csv");
  res.status(200).send(csv);
});

export const sendBulkNewsletter = asyncHandler(async (req, res, next) => {
  const { subject, content, contentType = "html" } = req.body;

  if (!subject || !content) {
    return next(new ErrorResponse("Subject and content are required", 400));
  }

  const subscribers = await Newsletter.find({ status: "subscribed" }).select(
    "email",
  );

  if (subscribers.length === 0) {
    return next(new ErrorResponse("No active subscribers found", 404));
  }

  const { sendNewsletterCampaign } = await import("../utils/sendEmail.js");

  const batchSize = 10;
  const results = {
    total: subscribers.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async (subscriber) => {
        try {
          if (contentType === "html") {
            await sendNewsletterCampaign(subscriber.email, subject, content);
          } else {
            const htmlContent = `<div style="font-family: Arial, sans-serif;">${content.replace(/\n/g, "<br>")}</div>`;
            await sendNewsletterCampaign(
              subscriber.email,
              subject,
              htmlContent,
              content,
            );
          }
          results.sent++;
          console.log(`Newsletter sent to ${subscriber.email}`);
        } catch (error) {
          results.failed++;
          results.errors.push({
            email: subscriber.email,
            error: error.message,
          });
          console.error(
            `Failed to send to ${subscriber.email}:`,
            error.message,
          );
        }
      }),
    );

    if (i + batchSize < subscribers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  res.status(200).json({
    success: true,
    message: "Bulk newsletter sending completed",
    data: {
      total: results.total,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.slice(0, 10),
    },
  });
});

export const getSubscriberDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const subscriber = await Newsletter.findById(id);

  if (!subscriber) {
    return next(new ErrorResponse("Subscriber not found", 404));
  }

  res.status(200).json({
    success: true,
    data: subscriber,
  });
});

export const deleteSubscriber = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const subscriber = await Newsletter.findByIdAndDelete(id);

  if (!subscriber) {
    return next(new ErrorResponse("Subscriber not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Subscriber deleted successfully",
  });
});

export const getSubscriptionStats = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalSubscribers,
    activeSubscribers,
    unsubscribed,
    newToday,
    newThisWeek,
    newThisMonth,
    newThisYear,
    subscriptionsBySource,
  ] = await Promise.all([
    Newsletter.countDocuments(),
    Newsletter.countDocuments({ status: "subscribed" }),
    Newsletter.countDocuments({ status: "unsubscribed" }),
    Newsletter.countDocuments({
      subscribedAt: { $gte: startOfToday },
      status: "subscribed",
    }),
    Newsletter.countDocuments({
      subscribedAt: { $gte: startOfWeek },
      status: "subscribed",
    }),
    Newsletter.countDocuments({
      subscribedAt: { $gte: startOfMonth },
      status: "subscribed",
    }),
    Newsletter.countDocuments({
      subscribedAt: { $gte: startOfYear },
      status: "subscribed",
    }),
    Newsletter.aggregate([
      { $match: { status: "subscribed" } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totals: {
        all: totalSubscribers,
        active: activeSubscribers,
        unsubscribed: unsubscribed,
      },
      newSubscriptions: {
        today: newToday,
        thisWeek: newThisWeek,
        thisMonth: newThisMonth,
        thisYear: newThisYear,
      },
      sources: subscriptionsBySource.reduce((acc, item) => {
        acc[item._id || "other"] = item.count;
        return acc;
      }, {}),
    },
  });
});
