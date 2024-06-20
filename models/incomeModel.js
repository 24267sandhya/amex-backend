const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please add an income amount"],
    },
    month: {
      type: String,
      required: [true, "Please add the month for the income"],
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Income || mongoose.model("Income", incomeSchema);
