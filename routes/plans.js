// routes/plans.js

const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");

// Get all plans
router.get("/", async (req, res, next) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    next(err); // Pass the error to the global error handler
  }
});

module.exports = router;
