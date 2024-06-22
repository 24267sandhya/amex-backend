const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const { requireSignIn } = require("../controllers/userController");

// POST route to submit feedback
router.post("/", requireSignIn, async (req, res) => {
  const { feedback } = req.body;
  const userId = req.user._id; // Assuming you use a middleware to set req.user

  if (!feedback) {
    return res
      .status(400)
      .json({ success: false, message: "Feedback is required" });
  }

  try {
    const newFeedback = new Feedback({ feedback, userId });
    await newFeedback.save();
    res
      .status(201)
      .json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
