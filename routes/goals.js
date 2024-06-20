const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const { requireSignIn } = require("../controllers/userController");

// Create a new goal
router.post("/", requireSignIn, async (req, res) => {
  const { date, amount, type, duration, category } = req.body;
  const userId = req.user._id; // Get the user ID from the authenticated user

  try {
    const goal = new Goal({
      date,
      amount,
      type,
      duration,
      category,
      currentAmount: 0,
      image: "https://via.placeholder.com/50",
      user: userId, // Associate the goal with the user
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error("Error saving goal:", error);
    res
      .status(500)
      .json({ message: "Failed to create goal", error: error.message });
  }
});

// Get all goals for the authenticated user
router.get("/", requireSignIn, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }); // Fetch goals for the authenticated user
    res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch goals", error: error.message });
  }
});

module.exports = router;
