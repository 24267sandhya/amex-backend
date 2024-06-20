const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transaction_date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transaction_type: {
    type: String,
    enum: ["debit", "credit"],
    required: true,
  },
  merchant: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
