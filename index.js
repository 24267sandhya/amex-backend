const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const axios = require("axios");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

require("../ScanAndPay/utils/scheduler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as necessary to limit to your frontend's domain
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
}).single("profilePicture");

// Import the Plan model
const Plan = require("./models/Plan");

// Routes
const plansRouter = require("./routes/plans");
const goalsRouter = require("./routes/goalRoutes"); // Add this line
const chatRoutes = require("./routes/chatRoutes"); // Chat routes
const userRoutes = require("./routes/userRoutes"); // User routes
const feedbackRoutes = require("./routes/feedbackRoutes");

app.use("/api/plans", plansRouter);
app.use("/api/v1/goal", goalsRouter); // Add this line
app.use("/api/chat", chatRoutes); // Chat routes
app.use("/api/v1/auth", userRoutes); // User routes
app.use("/api/v1/transaction", require("./routes/transactionRoutes"));
app.use("/api/v1/income", require("./routes/incomeRoutes"));
app.use("/api/v1/stock", require("./routes/stockRoutes"));

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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: err.message,
  });
});

// Socket.io connection for real-time chat
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const GEMINI_API_KEY = "AIzaSyBlCDikVqFYvBto7kEvpVHaLgd2x7eS-Gg";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${GEMINI_API_KEY}`;

app.use(bodyParser.json());

app.post("/generateMessage", async (req, res) => {
  const userMsg = req.body.message;

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        prompt: {
          messages: [{ content: userMsg }],
        },
        temperature: 0.25,
        candidateCount: 1,
        top_k: 40,
        top_p: 0.95,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching Bard API response:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to generate message" });
  }
});

app.post("/generateInvestmentPlan", async (req, res) => {
  const responses = req.body;

  const prompt = `Create an investment plan for a ${responses.age}-year-old with ${responses.savedMoney} rupees saved, a ${responses.riskTolerance} risk tolerance, an investment goal of ${responses.investmentGoals}, an investment horizon of ${responses.investmentHorizon}, an income level of ${responses.incomeLevel}, and expenses and liabilities: ${responses.expensesAndLiabilities}.`;

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        prompt: {
          messages: [{ content: prompt }],
        },
        temperature: 0.25,
        candidateCount: 1,
        top_k: 40,
        top_p: 0.95,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0
    ) {
      res.json(response.data.candidates[0].content);
    } else {
      throw new Error("No candidates found in the response");
    }
  } catch (error) {
    console.error(
      "Error fetching investment plan:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "Failed to generate investment plan",
      details: error.message,
    });
  }
});

app.post("/generateRetirementPlan", async (req, res) => {
  const responses = req.body;

  const prompt = `Create a retirement plan for a ${responses.age}-year-old who plans to retire at age ${responses.retirementAge}, with goals of ${responses.retirementGoals}, an income level of ${responses.incomeLevel}, insurance: ${responses.insurance}, and liabilities: ${responses.liabilities}.`;

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        prompt: {
          messages: [{ content: prompt }],
        },
        temperature: 0.25,
        candidateCount: 1,
        top_k: 40,
        top_p: 0.95,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0
    ) {
      res.json(response.data.candidates[0].content);
    } else {
      throw new Error("No candidates found in the response");
    }
  } catch (error) {
    console.error(
      "Error fetching retirement plan:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "Failed to generate retirement plan",
      details: error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
