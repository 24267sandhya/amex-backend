const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/50",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Goal", GoalSchema);
