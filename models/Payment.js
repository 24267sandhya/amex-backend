const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  qrData: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
