const mongoose = require("mongoose");

const jobRequestModel = mongoose.Schema(
  {
    jobCategory: { type: String },
    location: [{ type: String }],
    jobType: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const JobRequest = mongoose.model("JobRequest", jobRequestModel);

module.exports = JobRequest;
