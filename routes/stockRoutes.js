const express = require("express");
const { requireSignIn } = require("../controllers/userController");
const Stock = require("../models/stockModel");
const moment = require("moment");

const router = express.Router();

// Get all stock data
router.get("/stocks", requireSignIn, async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ date: -1 });
    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch stock data", error });
  }
});

// Endpoint to get the most recent stock details by symbol
router.get("/details/:symbol/:date", async (req, res) => {
  try {
    const { symbol, date } = req.params;
    const stockDetails = await Stock.findOne({ symbol, date: new Date(date) });

    if (!stockDetails) {
      return res
        .status(404)
        .json({
          message: "Stock details not found for the given symbol and date",
        });
    }

    res.json(stockDetails);
  } catch (error) {
    console.error("Error fetching stock details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const getMostRecentDate = () => {
  const today = moment();
  let mostRecentDate = today;

  if (today.day() === 0) {
    // Sunday, get the previous Friday
    mostRecentDate = today.subtract(2, "days");
  } else if (today.day() === 6) {
    // Saturday, get the previous Friday
    mostRecentDate = today.subtract(1, "days");
  } else if (today.day() === 1) {
    // Monday, get the previous Friday
    mostRecentDate = today.subtract(3, "days");
  } else {
    // For Tuesday to Friday, get the previous day
    mostRecentDate = today.subtract(1, "day");
  }

  return mostRecentDate.format("YYYY-MM-DD");
};

// Route to get stock history by symbol
router.get("/history/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const mostRecentDate = getMostRecentDate();
    const stockHistory = await Stock.find({
      symbol,
      date: { $lte: new Date(mostRecentDate) },
    })
      .sort({ date: -1 })
      .limit(10);

    if (!stockHistory || stockHistory.length === 0) {
      return res
        .status(404)
        .json({ message: "Stock history not found for the given symbol" });
    }

    // Sort the data in ascending order by date for the chart
    const sortedHistory = stockHistory.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.json(sortedHistory);
  } catch (error) {
    console.error("Error fetching stock history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/recommended", requireSignIn, async (req, res) => {
  try {
    const mostRecentDate = getMostRecentDate();
    const oneMonthAgo = moment().subtract(1, "month").format("YYYY-MM-DD");

    const stocks = await Stock.find({
      date: { $gte: new Date(oneMonthAgo), $lte: new Date(mostRecentDate) },
    }).sort({ date: 1 });

    const stockPerformance = stocks.reduce((acc, stock) => {
      if (!acc[stock.symbol]) {
        acc[stock.symbol] = {
          symbol: stock.symbol,
          name: stock.name,
          mostRecentDetails: stock,
          history: [stock],
        };
      } else {
        acc[stock.symbol].history.push(stock);
        if (
          new Date(stock.date) >
          new Date(acc[stock.symbol].mostRecentDetails.date)
        ) {
          acc[stock.symbol].mostRecentDetails = stock;
        }
      }
      return acc;
    }, {});

    const performanceArray = Object.values(stockPerformance).map((stock) => {
      const { mostRecentDetails } = stock;
      const { close: currentValue, open } = mostRecentDetails;
      const dailyReturn = currentValue - open;
      return { ...stock, currentValue, dailyReturn };
    });

    performanceArray.sort((a, b) => b.currentValue - a.currentValue);

    const top5Stocks = performanceArray.slice(0, 5);

    res.json(top5Stocks);
  } catch (error) {
    console.error("Error fetching recommended stocks:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch recommended stocks",
        error,
      });
  }
});

module.exports = router;
