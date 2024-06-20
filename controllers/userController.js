const jwt = require("jsonwebtoken");
const qrcode = require("qrcode");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");
const transactionModel = require("../models/transactionModel");
const Stock = require("../models/stockModel");

// Middleware to verify JWT token
const requireSignIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Authorization Header:", authHeader); // Debugging statement

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("Token received:", token); // Debugging statement
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userModel.findById(decoded._id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    console.error("JWT verification error:", err); // Debugging statement
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

const getProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

const updateProfilePictureController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "No file uploaded",
      });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).send({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating profile picture",
      error: error.message,
    });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const { name, password, profilePicture } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (password && password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password should be at least 6 characters long",
      });
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    user.name = name || user.name;
    user.password = hashedPassword || user.password;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    user.password = undefined;

    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// REGISTER
const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message:
          "Password is required and should be at least 6 characters long",
      });
    }

    // check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // save user
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // Generate QR Code for the user
    const qrCode = await qrcode.toDataURL(user._id.toString());
    user.qrCode = qrCode;
    await user.save();

    res.status(201).send({
      success: true,
      message: "Registration successful, please login",
      qrCode: user.qrCode,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

// LOGIN
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      });
    }

    // find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    // match password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // generate JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // exclude password from the response
    user.password = undefined;

    res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in login API",
      error,
    });
  }
};

// Update User
const updateUserController = async (req, res) => {
  try {
    const { name, password } = req.body;

    // find user
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // validate password
    if (password && password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password should be at least 6 characters long",
      });
    }

    // hash new password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // update user
    user.name = name || user.name;
    user.password = hashedPassword || user.password;

    await user.save();

    // exclude password from the response
    user.password = undefined;

    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in user update API",
      error,
    });
  }
};
const getUserQrCode = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      qrCode: user._id.toString(), // Make sure the qrCode value is the user ID
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching QR code",
      error,
    });
  }
};

const saveCardDetails = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, paymentPassword } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    const newCard = { cardNumber, expiryDate, cvv };

    if (!user.paymentPassword) {
      const hashedPassword = await hashPassword(paymentPassword);
      user.paymentPassword = hashedPassword;
    }

    user.cards.push(newCard);
    await user.save();

    res.status(200).send({
      success: true,
      message: "Card details saved successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error saving card details",
      error,
    });
  }
};

const processPayment = async (req, res) => {
  try {
    const {
      recipientId,
      amount,
      cardId,
      paymentPassword,
      category = "Others",
    } = req.body;
    const senderId = req.user._id;
    console.log("recipientId", recipientId);
    // Validate recipientId and cardId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid recipientId",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid cardId",
      });
    }

    const sender = await userModel.findById(senderId);
    const recipient = await userModel.findById(recipientId);

    // Validate payment password
    const match = await comparePassword(
      paymentPassword,
      sender.paymentPassword
    );
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Invalid payment password",
      });
    }

    // Validate card
    const card = sender.cards.id(cardId);
    if (!card) {
      return res.status(400).send({
        success: false,
        message: "Card not found",
      });
    }

    // Add debit transaction to sender
    await transactionModel.create({
      user: sender._id,
      amount,
      transaction_type: "debit",
      merchant: recipient.name,
      category,
      transaction_date: new Date(),
    });

    // Add credit transaction to recipient
    await transactionModel.create({
      user: recipient._id,
      amount,
      transaction_type: "credit",
      merchant: sender.name,
      category: "Others",
      transaction_date: new Date(),
    });

    res.status(200).send({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("Error processing payment:", error); // Log the error to the console for debugging
    res.status(500).send({
      success: false,
      message: "Error processing payment",
      error: error.message,
    });
  }
};

const getCards = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel
      .findById(userId)
      .select("cards paymentPassword");
    res.status(200).send({
      success: true,
      cards: user.cards,
      hasPaymentPassword: !!user.paymentPassword,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching cards",
      error,
    });
  }
};

const saveUserDetails = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the request body
    const {
      fullName,
      aadhaar,
      pan,
      phone,
      bankName,
      accountNumber,
      ifsc,
      investmentPassword,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Authenticated User ID:", req.user._id); // Log authenticated user ID

    const hashedAadhaar = await hashPassword(aadhaar);
    const hashedPan = await hashPassword(pan);
    const hashedAccountNumber = await hashPassword(accountNumber);
    const hashedInvestmentPassword = await hashPassword(investmentPassword);

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.details = {
      fullName,
      aadhaar: hashedAadhaar,
      pan: hashedPan,
      phone,
      bankName,
      accountNumber: hashedAccountNumber,
      ifsc,
      investmentPassword: hashedInvestmentPassword,
    };

    await user.save();

    res.json({ message: "Details saved successfully" });
  } catch (error) {
    console.error("Error saving details:", error); // Log the error to the console for debugging
    res
      .status(500)
      .json({ error: "Failed to save details", details: error.message });
  }
};

const checkUserDetails = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure all fields are checked to determine if details exist
    const requiredFields = [
      "fullName",
      "aadhaar",
      "pan",
      "phone",
      "bankName",
      "accountNumber",
      "ifsc",
      "investmentPassword",
    ];
    const detailsExist = requiredFields.every(
      (field) => user.details && user.details[field]
    );
    res.json({ detailsExist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check details" });
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const match = await comparePassword(
      password,
      user.details.investmentPassword
    );
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    res.json({ success: true, message: "Password verified" });
  } catch (error) {
    console.error("Error verifying password:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify password", error });
  }
};

const buyStock = async (req, res) => {
  try {
    const {
      stockName,
      stockSymbol,
      quantity,
      totalPrice,
      currentPrice,
      dailyReturn,
    } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user already owns the stock
    const existingStock = user.stocks.find(
      (stock) => stock.stockSymbol === stockSymbol
    );

    if (existingStock) {
      // Update existing stock entry
      existingStock.quantity += quantity;
      existingStock.totalPrice += totalPrice;
      existingStock.currentPrice += currentPrice;
      existingStock.dailyReturn = dailyReturn;
    } else {
      // Add new stock entry
      user.stocks.push({
        stockName,
        stockSymbol,
        quantity,
        totalPrice,
        currentPrice,
        dailyReturn,
        purchaseDate: new Date(),
        totalReturn: 0,
      });
    }

    await user.save();

    res.json({ success: true, message: "Stock purchased successfully" });
  } catch (error) {
    console.error("Error purchasing stock:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to purchase stock", error });
  }
};

const sellStock = async (req, res) => {
  try {
    const { stockSymbol, quantity, totalPrice } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the stock in user's portfolio
    const stock = user.stocks.find((s) => s.stockSymbol === stockSymbol);
    if (!stock) {
      return res
        .status(400)
        .json({ success: false, message: "Stock not found in portfolio" });
    }

    if (stock.quantity < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock quantity" });
    }

    // Update the stock quantity and current price
    stock.quantity -= quantity;
    stock.currentPrice -= totalPrice;

    if (stock.quantity === 0) {
      user.stocks = user.stocks.filter((s) => s.stockSymbol !== stockSymbol);
    }

    await user.save();

    res.json({ success: true, message: "Stock sold successfully" });
  } catch (error) {
    console.error("Error selling stock:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to sell stock", error });
  }
};

const getUserPurchasedStocks = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("stocks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.stocks);
  } catch (error) {
    console.error("Error fetching user stocks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const buyFund = async (req, res) => {
  try {
    const { fundName, amount } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const fund = user.funds.find((f) => f.fundName === fundName);
    if (fund) {
      fund.amount += amount; // Add to existing amount
    } else {
      user.funds.push({ fundName, amount });
    }
    await user.save();

    res.json({ success: true, message: "Fund purchased successfully" });
  } catch (error) {
    console.error("Error purchasing fund:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to purchase fund", error });
  }
};

const getUserFunds = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("funds");
    res.json({ funds: user.funds });
  } catch (error) {
    console.error("Error fetching funds:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch funds", error });
  }
};
const sellFund = async (req, res) => {
  try {
    const { fundName, amount, password } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const fund = user.funds.find((f) => f.fundName === fundName);
    if (!fund) {
      return res
        .status(400)
        .json({ success: false, message: "Fund not found" });
    }

    if (fund.amount < amount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient funds" });
    }

    const match = await comparePassword(
      password,
      user.details.investmentPassword
    );
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    fund.amount -= amount;
    if (fund.amount === 0) {
      user.funds = user.funds.filter((f) => f.fundName !== fundName);
    }

    await user.save();

    res.json({ success: true, message: "Fund sold successfully" });
  } catch (error) {
    console.error("Error selling fund:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to sell fund", error });
  }
};

module.exports = {
  getUserQrCode,
  requireSignIn,
  registerController,
  loginController,
  getProfileController,
  updateUserController,
  saveCardDetails,
  processPayment,
  getCards,
  saveUserDetails,
  checkUserDetails,
  verifyPassword,
  buyStock,
  sellStock,
  getUserPurchasedStocks,
  buyFund,
  getUserFunds,
  sellFund,
  updateProfileController,
  updateProfilePictureController,
};
