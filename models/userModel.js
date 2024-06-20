const mongoose = require("mongoose");
const cardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
});

const stockSchema = new mongoose.Schema({
  stockName: String,
  stockSymbol: String,
  quantity: Number,
  totalPrice: Number,
  currentPrice: Number,
  dailyReturn: Number,
  purchaseDate: Date,
  totalReturn: Number,
});

const fundSchema = new mongoose.Schema({
  fundName: String,
  amount: Number,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add email"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add password"],
      minlength: 6,
      maxlength: 64,
    },
    role: {
      type: String,
      default: "user",
    },
    profilePicture: {
      type: String,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    qrCode: {
      type: String,
      required: true,
    },
    paymentPassword: {
      type: String,
    },
    cards: [cardSchema],
    details: {
      fullName: String,
      aadhaar: String,
      pan: String,
      phone: String,
      bankName: String,
      accountNumber: String,
      ifsc: String,
      investmentPassword: String,
    },
    stocks: [stockSchema],
    funds: [fundSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
