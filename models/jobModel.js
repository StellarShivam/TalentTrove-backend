const mongoose = require("mongoose");

const userModel = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    resumeScore: { type: Number },
    resumeSummary: { type: String },
    status: { type: String, default: "In Review" },
  },
  { timestamps: true }
);

const jobModel = mongoose.Schema(
  {
    logo: { type: String },
    jobCategory: { type: String, required: true },
    jobTitle: { type: String, required: true },
    companyName: { type: String },
    location: [{ type: String, required: true }],
    jobType: { type: String },
    jobDescription: { type: String },
    jobPosted: { type: String },
    applyLink: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applicants: [userModel],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobModel);

module.exports = Job;
