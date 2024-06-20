const Plan = require("../models/Plan");

exports.updateInvestment = async (req, res) => {
  const { planId, amountInvested, timeInvested } = req.body;

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    plan.amountInvested = amountInvested;
    plan.timeInvested = timeInvested;
    await plan.save();

    res.json({ success: true, plan });
  } catch (error) {
    console.error("Error updating investment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
