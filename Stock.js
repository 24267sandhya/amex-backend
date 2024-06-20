const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Stock = require("./models/stockModel");

dotenv.config();

// Connect to the database
mongoose.connect(process.env.MONGO_URL);

const saveStockData = async (filePath, symbol, name) => {
  const data = fs.readFileSync(filePath, "utf8");
  const jsonData = JSON.parse(data);
  const timeSeries = jsonData["Time Series (Daily)"];

  const stockData = Object.keys(timeSeries).map((date) => ({
    date: new Date(date),
    open: parseFloat(timeSeries[date]["1. open"]),
    high: parseFloat(timeSeries[date]["2. high"]),
    low: parseFloat(timeSeries[date]["3. low"]),
    close: parseFloat(timeSeries[date]["4. close"]),
    volume: parseInt(timeSeries[date]["5. volume"], 10),
    symbol,
    name,
  }));

  await Stock.insertMany(stockData);
  console.log(`Saved data for ${name}`);
};

const run = async () => {
  try {
    const assetsPath =
      "C:/Users/Avipsa/Desktop/Avipsa/React-Native/TrackMudra/assets";

    await saveStockData(
      path.join(assetsPath, "BAJFINANCE.json"),
      "BAJFINANCE.BSE",
      "Bajaj Finance"
    );
    await saveStockData(
      path.join(assetsPath, "BHARTIARTL.json"),
      "BHARTIARTL.BSE",
      "Bharti Airtel"
    );
    await saveStockData(
      path.join(assetsPath, "HCLTECH.json"),
      "HCLTECH.BSE",
      "HCL Technologies"
    );
    await saveStockData(
      path.join(assetsPath, "HDFCBANK.json"),
      "HDFCBANK.BSE",
      "HDFC Bank"
    );
    await saveStockData(
      path.join(assetsPath, "HINDUNILVR.json"),
      "HINDUNILVR.BSE",
      "Hindustan Unilever"
    );
    await saveStockData(
      path.join(assetsPath, "INFY.json"),
      "INFY.BSE",
      "Infosys"
    );
    await saveStockData(path.join(assetsPath, "ITC.json"), "ITC.BSE", "ITC");
    await saveStockData(
      path.join(assetsPath, "KOTAKBANK.json"),
      "KOTAKBANK.BSE",
      "Kotak Mahindra Bank"
    );
    await saveStockData(
      path.join(assetsPath, "LT.json"),
      "LT.BSE",
      "Larsen & Toubro"
    );
    await saveStockData(
      path.join(assetsPath, "MARUTI.json"),
      "MARUTI.BSE",
      "Maruti Suzuki"
    );
    await saveStockData(
      path.join(assetsPath, "ONGC.json"),
      "ONGC.BSE",
      "Oil and Natural Gas Corporation"
    );
    await saveStockData(
      path.join(assetsPath, "POWERGRID.json"),
      "POWERGRID.BSE",
      "Power Grid Corporation of India"
    );
    await saveStockData(
      path.join(assetsPath, "Reliance.json"),
      "RELIANCE.BSE",
      "Reliance Industries Limited"
    );
    await saveStockData(
      path.join(assetsPath, "SBIN.json"),
      "SBIN.BSE",
      "State Bank of India"
    );
    await saveStockData(
      path.join(assetsPath, "TCS.json"),
      "TCS.BSE",
      "Tata Consultancy Services"
    );
    mongoose.disconnect();
  } catch (error) {
    console.error("Error saving stock data:", error);
    mongoose.disconnect();
  }
};

run();
