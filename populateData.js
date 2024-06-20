const mongoose = require("mongoose");
const Plan = require("./models/Plan");
require("dotenv").config();

const plans = [
  {
    title: "TATA AIA Fortune Maxima",
    amountInvested: 25000,
    timeInvested: 2,
    image:
      "https://www.cityunionbank.com/filemanager/webimages/Fortune-Guarantee-Pension.jpg",
    description:
      "A comprehensive retirement plan that provides life coverage and wealth creation benefits.",
    eligibility: "18 to 65 years",
    benefits: ["Wealth creation", "Life coverage", "Tax benefits"],
    category: "Wealth",
    officialWebsite: "https://www.tataaia.com",
    contactInfo: "1800-209-0101",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed returns and bonuses",
    targetAudience: "Individuals looking for a long-term investment",
    termsAndConditions: "Policy term ranges from 10 to 40 years",
    status: "Active",
  },
  {
    title: "HDFC Life Click 2 Wealth",
    amountInvested: 50000,
    timeInvested: 5,
    image:
      "https://www.jagoinvestor.com/wp-content/uploads/files/HDFC-life-Click-2-wealth-600x314.png",
    description:
      "A unit-linked plan that offers market-linked returns along with life cover.",
    eligibility: "18 to 65 years",
    benefits: ["Market-linked returns", "Life cover", "Tax benefits"],
    category: "Wealth",
    officialWebsite: "https://www.hdfclife.com",
    contactInfo: "1800-266-9777",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Flexible premium payment options",
    targetAudience: "Individuals looking for market-linked returns",
    termsAndConditions: "Lock-in period of 5 years",
    status: "Active",
  },
  {
    title: "ICICI Pru Smart Life",
    amountInvested: 75000,
    timeInvested: 10,
    image:
      "https://5.imimg.com/data5/FW/NQ/NL/SELLER-24358099/icici-pru-smart-life-500x500.jpg",
    description:
      "A retirement plan that provides protection and savings with additional loyalty rewards.",
    eligibility: "18 to 65 years",
    benefits: ["Protection and savings", "Loyalty rewards", "Tax benefits"],
    category: "Savings",
    officialWebsite: "https://www.iciciprulife.com",
    contactInfo: "1860-266-7766",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed loyalty additions",
    targetAudience:
      "Individuals seeking a combination of protection and savings",
    termsAndConditions: "Policy term ranges from 10 to 30 years",
    status: "Active",
  },
  {
    title: "SBI Life - Retire Smart",
    amountInvested: 100000,
    timeInvested: 15,
    image: "https://i.ytimg.com/vi/W5i2_UhCU38/maxresdefault.jpg",
    description:
      "A non-participating unit-linked insurance plan that offers systematic retirement planning.",
    eligibility: "30 to 60 years",
    benefits: ["Systematic retirement planning", "Life cover", "Tax benefits"],
    category: "Retirement",
    officialWebsite: "https://www.sbilife.co.in",
    contactInfo: "1800-267-9090",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Regular income post retirement",
    targetAudience: "Individuals looking for a systematic retirement plan",
    termsAndConditions: "Lock-in period of 5 years",
    status: "Active",
  },
  {
    title: "Max Life Forever Young Pension Plan",
    amountInvested: 200000,
    timeInvested: 20,
    image:
      "https://3.bp.blogspot.com/-iztP8jRNJSI/WolgyogL5zI/AAAAAAAAACQ/NkyD8vf8-s4PNVTT9kfGVtsZiR6mPCY6gCEwYBhgL/s1600/youngpensionbanner.jpg",
    description:
      "A pension plan that provides regular income post-retirement with guaranteed benefits.",
    eligibility: "30 to 65 years",
    benefits: [
      "Guaranteed benefits",
      "Regular income post-retirement",
      "Tax benefits",
    ],
    category: "Pension",
    officialWebsite: "https://www.maxlifeinsurance.com",
    contactInfo: "1860-120-5577",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed lifetime income",
    targetAudience: "Individuals planning for post-retirement income",
    termsAndConditions: "Policy term ranges from 10 to 40 years",
    status: "Active",
  },
  {
    title: "Birla Sun Life Insurance Vision LifeSecure Plan",
    amountInvested: 0,
    timeInvested: 0,
    image:
      "https://www.comparepolicy.com/properties/news/20170308_105745_LgABF_birla-sunlife-insurance.jpg",
    description:
      "A traditional participating endowment plan with the benefits of life insurance coverage.",
    eligibility: "18 to 55 years",
    benefits: ["Life insurance", "Endowment benefits", "Tax savings"],
    category: "Endowment",
    officialWebsite: "https://www.birlasunlife.com",
    contactInfo: "1800-270-7000",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed additions and bonuses",
    targetAudience: "Individuals looking for an endowment plan",
    termsAndConditions: "Policy term ranges from 10 to 30 years",
    status: "Active",
  },
  {
    title: "LIC Jeevan Shanti",
    amountInvested: 0,
    timeInvested: 0,
    image:
      "https://tse4.mm.bing.net/th?id=OIP.-sVSHHXnP7skeQt1BQBQnAHaEK&pid=Api&P=0&h=180",
    description:
      "A single premium annuity plan offering immediate and deferred annuity options.",
    eligibility: "30 to 85 years",
    benefits: ["Immediate annuity", "Deferred annuity", "Tax benefits"],
    category: "Annuity",
    officialWebsite: "https://www.licindia.in",
    contactInfo: "1800-123-7582",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed annuity payouts",
    targetAudience: "Individuals seeking regular income post-retirement",
    termsAndConditions: "Single premium payment",
    status: "Active",
  },
  {
    title: "Kotak Premier Pension Plan",
    amountInvested: 0,
    timeInvested: 0,
    image:
      "https://kurinchieseva.com/wp-content/uploads/2023/01/download-5-1-thegem-product-justified-portrait-s-1.png",
    description:
      "A pension plan that helps in systematic retirement planning with guaranteed additions.",
    eligibility: "30 to 55 years",
    benefits: ["Pension benefits", "Tax benefits", "Guaranteed additions"],
    category: "Pension",
    officialWebsite: "https://www.kotaklife.com",
    contactInfo: "1800-209-8800",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed yearly additions",
    targetAudience: "Individuals looking for retirement planning",
    termsAndConditions: "Policy term ranges from 10 to 30 years",
    status: "Active",
  },
  {
    title: "Reliance Nippon Life Pension Builder",
    amountInvested: 0,
    timeInvested: 0,
    image:
      "https://tse4.mm.bing.net/th?id=OIP.zSWv_p6T1YW57_AXnKcJCAHaES&pid=Api&P=0&h=180",
    description:
      "A traditional non-participating pension plan offering guaranteed benefits.",
    eligibility: "18 to 65 years",
    benefits: ["Pension benefits", "Guaranteed additions", "Tax benefits"],
    category: "Pension",
    officialWebsite: "https://www.reliancenipponlife.com",
    contactInfo: "1800-102-1010",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed benefits and bonuses",
    targetAudience: "Individuals planning for retirement",
    termsAndConditions: "Policy term ranges from 10 to 20 years",
    status: "Active",
  },
  {
    title: "Bajaj Allianz Pension Guarantee",
    amountInvested: 0,
    timeInvested: 0,
    image:
      "https://www.holisticinvestment.in/wp-content/uploads/2022/10/Bajaj-Allianz-Life-Guaranteed-Income-Goal.png",
    description:
      "A unit-linked pension plan that offers market-linked returns along with life cover.",
    eligibility: "30 to 55 years",
    benefits: ["Market-linked returns", "Life cover", "Tax benefits"],
    category: "Pension",
    officialWebsite: "https://www.bajajallianz.com",
    contactInfo: "1800-209-5858",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Market-linked returns and bonuses",
    targetAudience: "Individuals seeking market-linked returns",
    termsAndConditions: "Policy term ranges from 10 to 20 years",
    status: "Active",
  },
  {
    title:
      "Canara HSBC Oriental Bank of Commerce Life Insurance Guaranteed Income Plan",
    amountInvested: 0,
    timeInvested: 0,
    image: "https://www.lifeinscouncil.org/images/company_logo/CanaraLogo.png",
    description:
      "A non-linked, non-participating life insurance plan that provides guaranteed income.",
    eligibility: "18 to 55 years",
    benefits: ["Guaranteed income", "Life cover", "Tax benefits"],
    category: "Income",
    officialWebsite: "https://www.canarahsbclife.com",
    contactInfo: "1800-103-0003",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed income and bonuses",
    targetAudience: "Individuals looking for guaranteed income",
    termsAndConditions: "Policy term ranges from 10 to 20 years",
    status: "Active",
  },
  {
    title: "IDBI Federal Wealth Gain Insurance Plan",
    amountInvested: 0,
    timeInvested: 0,
    image:
      "https://globalprimenews.com/wp-content/uploads/2020/05/images-4.jpeg",
    description:
      "A unit-linked insurance plan that offers market-linked returns and life cover.",
    eligibility: "18 to 55 years",
    benefits: ["Market-linked returns", "Life cover", "Tax benefits"],
    category: "Wealth",
    officialWebsite: "https://www.idbifederal.com",
    contactInfo: "1800-209-0502",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Market-linked returns and bonuses",
    targetAudience: "Individuals seeking market-linked returns",
    termsAndConditions: "Policy term ranges from 10 to 30 years",
    status: "Active",
  },
  {
    title: "Aviva New Family Income Builder",
    amountInvested: 0,
    timeInvested: 0,
    image: "https://pbs.twimg.com/media/EPBt8aeU4AE4MvY.jpg",
    description:
      "A traditional endowment plan that provides regular income for 12 years after the premium payment term.",
    eligibility: "18 to 50 years",
    benefits: ["Regular income", "Life cover", "Tax benefits"],
    category: "Income",
    officialWebsite: "https://www.avivaindia.com",
    contactInfo: "1800-103-7766",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Regular income and bonuses",
    targetAudience: "Individuals looking for regular income",
    termsAndConditions: "Policy term ranges from 12 to 22 years",
    status: "Active",
  },
  {
    title: "PNB MetLife Guaranteed Future Plan",
    amountInvested: 0,
    timeInvested: 0,
    image:
      "https://www.aboutpathankot.com/wp-content/uploads/2015/04/PNB-MetLife.jpg",
    description:
      "A non-linked, non-participating savings plan that provides guaranteed returns.",
    eligibility: "18 to 55 years",
    benefits: ["Guaranteed returns", "Life cover", "Tax benefits"],
    category: "Savings",
    officialWebsite: "https://www.pnbmetlife.com",
    contactInfo: "1800-425-6969",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed returns and bonuses",
    targetAudience: "Individuals looking for guaranteed returns",
    termsAndConditions: "Policy term ranges from 10 to 20 years",
    status: "Active",
  },
  {
    title: "Sahara Life Saharayn Sampann Bima Yojana",
    amountInvested: 0,
    timeInvested: 0,
    image:
      "https://www.fincash.com/b/wp-content/uploads/2017/01/Sahara-Life-Insurance-india.jpg",
    description:
      "A traditional endowment plan that offers financial protection and savings.",
    eligibility: "18 to 50 years",
    benefits: ["Financial protection", "Endowment benefits", "Tax savings"],
    category: "Endowment",
    officialWebsite: "https://www.saharalife.com",
    contactInfo: "1800-180-9000",
    documentsRequired: ["Aadhaar card", "PAN card", "Address proof"],
    financialSupport: "Guaranteed additions and bonuses",
    targetAudience: "Individuals looking for an endowment plan",
    termsAndConditions: "Policy term ranges from 10 to 25 years",
    status: "Active",
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    return Plan.insertMany(plans);
  })
  .then(() => {
    console.log("Data inserted");
    mongoose.connection.close();
  })
  .catch((err) => console.log(err));
