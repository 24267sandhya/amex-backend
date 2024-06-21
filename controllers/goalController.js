const Goal = require('../models/Goal');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

// Add goal
exports.addGoal = async (req, res) => {
  const { startDate, endDate, amount, category, alertAmount } = req.body;

  try {
    const goal = new Goal({
      startDate,
      endDate,
      amount,
      category,
      alertAmount,
      user: req.user._id,
      currentAmount: 0,
      image: "https://via.placeholder.com/50", // default image URL
    });

    // Fetch debit transactions in the specified category and date range to update currentAmount
    const transactions = await Transaction.find({
      user: req.user._id,
      category,
      transaction_type: "debit",
      transaction_date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    const totalExpense = transactions.reduce((total, transaction) => total + transaction.amount, 0);

    goal.currentAmount = totalExpense;

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error("Error saving goal:", error);
    res.status(500).json({ message: "Failed to create goal", error: error.message });
  }
};

// Get user goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id, completed: { $ne: true } });

    const updatedGoals = await Promise.all(goals.map(async (goal) => {
      const transactions = await Transaction.find({
        user: req.user._id,
        category: goal.category,
        transaction_type: "debit",
        transaction_date: {
          $gte: new Date(goal.startDate),
          $lte: new Date(goal.endDate),
        },
      });

      const totalExpense = transactions.reduce((total, transaction) => total + transaction.amount, 0);

      goal.currentAmount = totalExpense;

      await goal.save(); // Save the updated goal

      return goal;
    }));

    res.status(200).json(updatedGoals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ message: "Failed to fetch goals", error: error.message });
  }
};

// Mark goal as completed
exports.markedGoals = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.completed = true;
    await goal.save();

    // Add reward points to the user
    const user = await User.findById(req.user._id);
    user.rewardPoints += 200; // Add 200 points for completing a goal
    await user.save();

    res.status(200).json({ message: "Goal marked as completed and reward points added" });
  } catch (error) {
    console.error("Error marking goal as completed:", error);
    res.status(500).json({ message: "Failed to mark goal as completed", error: error.message });
  }
};

// Get completed goals
exports.getCompletedGoals = async (req, res) => {
  try {
    const completedGoals = await Goal.find({ user: req.user._id, completed: true });
    res.status(200).json(completedGoals);
  } catch (error) {
    console.error("Error fetching completed goals:", error);
    res.status(500).json({ message: "Failed to fetch completed goals", error: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const { currentAmount } = req.body;
    goal.currentAmount = currentAmount;

    await goal.save();
    res.status(200).json({ message: "Goal updated successfully", goal });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ message: "Failed to update goal", error: error.message });
  }
};