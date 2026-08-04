import express from "express";
import {
  getUnseenAnnouncements,
  markAnnouncementSeen,
} from "../services/announcementService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const announcements = await getUnseenAnnouncements(req.playerId);

    res.json({
      announcements,
    });
  } catch (err) {
    console.error("Announcement fetch error:", err);
    res.status(500).json({
      error: "Failed to fetch announcements",
    });
  }
});

router.post("/:id/seen", async (req, res) => {
  try {
    await markAnnouncementSeen(req.playerId, req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("Announcement seen error:", err);
    res.status(500).json({
      error: "Failed to update announcement",
    });
  }
});

export default router;
