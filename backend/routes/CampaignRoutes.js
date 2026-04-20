import express from "express";
import Campaign from "../models/Campaign.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/active", async (req, res) => {
  try {
    const campaigns = await Campaign.getActiveCampaigns();
    res.json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug });
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, error: "Campaign not found" });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, error: "Campaign not found" });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, error: "Campaign not found" });
    }
    res.json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
