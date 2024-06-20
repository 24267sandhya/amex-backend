const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amountInvested: { type: Number, required: true },
  timeInvested: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  eligibility: { type: String, required: true },
  benefits: { type: [String], required: true },
  category: { type: String, required: true },
  officialWebsite: { type: String, required: true },
  contactInfo: { type: String, required: true },
  documentsRequired: { type: [String], required: true },
  financialSupport: { type: String, required: true },
  targetAudience: { type: String, required: true },
  termsAndConditions: { type: String, required: true },
  status: { type: String, required: true },
});

module.exports = mongoose.model("Plan", PlanSchema);
