const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

require("../ScanAndPay/utils/scheduler");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Import the Plan model
const Plan = require("./models/Plan");

// Routes
const plansRouter = require("./routes/plans");
const goalsRouter = require("./routes/goals"); // Add this line
app.use("/api/plans", plansRouter);
app.use("/api/goals", goalsRouter); // Add this line

app.post("/pay", async (req, res, next) => {
  try {
    const { qrData, amount } = req.body;
    const payment = new Payment({ qrData, amount });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
});

app.get("/payments", async (req, res, next) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
});

// Update investment details
app.post("/api/update-investment", async (req, res, next) => {
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
    next(error);
  }
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth routes
app.use("/api/v1/auth", require("./routes/userRoutes"));
app.use("/api/v1/transaction", require("./routes/transactionRoutes"));
app.use("/api/v1/income", require("./routes/incomeRoutes"));
app.use("/api/v1/stock", require("./routes/stockRoutes"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: err.message,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
