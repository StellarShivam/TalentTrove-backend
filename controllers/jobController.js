const { name } = require("agenda/dist/agenda/name");
const Job = require("../models/jobModel");
const JobRequest = require("../models/jobRequestModel");
const User = require("../models/userModel");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");

const genAI = new GoogleGenerativeAI("AIzaSyBHk6Vv2emeNYwRXpAHrIcwxz6gkNVpP2E");

exports.fetchJobs = async (req, res, next) => {
  const keyword = req.params.keyword;
  const cities = req.params.cities;
  const jobtype = req.params.jobtype;
  const verifed = req.params.verified;

  const citiesArr = cities.split("-");
  const jobtypeArr = jobtype.split("-");
  let query;

  if (jobtypeArr[0] == "" && citiesArr[0] != "") {
    query = {
      $and: [
        {
          $or: [
            { jobDescription: { $regex: keyword, $options: "i" } },
            { jobTitle: { $regex: keyword, $options: "i" } },
          ],
        },
        {
          location: { $in: citiesArr },
        },
      ],
    };
    if (verifed == "true") {
      // Only add the condition if verifed is true
      console.log("in");
      query.$and.push({ verified: true });
    }
  } else if (citiesArr[0] == "" && jobtypeArr[0] != "") {
    query = {
      $and: [
        {
          $or: [
            { jobDescription: { $regex: keyword, $options: "i" } },
            { jobTitle: { $regex: keyword, $options: "i" } },
          ],
        },
        {
          jobType: { $in: jobtypeArr },
        },
      ],
    };
    if (verifed == "true") {
      // Only add the condition if verifed is true
      console.log("in");
      query.$and.push({ verified: true });
    }
  } else if (citiesArr[0] == "" && jobtypeArr[0] == "") {
    query = {
      $and: [
        {
          $or: [
            { jobDescription: { $regex: keyword, $options: "i" } },
            { jobTitle: { $regex: keyword, $options: "i" } },
          ],
        },
      ],
    };
    if (verifed == "true") {
      // Only add the condition if verifed is true
      console.log("in");
      query.$and.push({ verified: true });
    }
  } else {
    query = {
      $and: [
        {
          $or: [
            { jobDescription: { $regex: keyword, $options: "i" } },
            { jobTitle: { $regex: keyword, $options: "i" } },
          ],
        },
        {
          jobType: { $in: jobtypeArr },
        },
        {
          location: { $in: citiesArr },
        },
      ],
    };
    if (verifed == "true") {
      // Only add the condition if verifed is true
      console.log("in");
      query.$and.push({ verified: true });
    }
  }

  const jobs = await Job.find(query);

  res.json({ jobs });
  //   console.log(jobs);
};

exports.fetchAllCities = async (req, res, next) => {
  const uniqueCities = await Job.distinct("location");

  res.json({ uniqueCities });
};

exports.fetchJobDetails = async (req, res, next) => {
  const jobId = req.params.jobId;
  const jobData = await Job.findById(jobId);
  console.log(jobData);
  res.json({ jobData });
};

exports.addToJobApplied = async (req, res, next) => {
  const { userId } = req.user;
  const { jobTitle, companyName, location, jobType, applyLink } = req.body;
  const newData = { jobTitle, companyName, location, jobType, applyLink };

  const result = await User.findOneAndUpdate(
    { _id: userId },
    { $push: { appliedJobs: newData } }
  );
  res.json({ message: "Job added successfully to applied job section" });
};

exports.appliedJobs = async (req, res, next) => {
  const { userId } = req.user;
  const data = await User.findOne({ _id: userId });
  res.json({ appliedJobs: data.appliedJobs });
};

exports.createJob = async (req, res, next) => {
  const { userId } = req.user;
  const { jobCategory, jobTitle, location, jobType, jobDescription } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newJob = new Job({
    jobCategory,
    jobTitle,
    companyName: user.name,
    location,
    jobType,
    jobDescription,
    creator: userId,
    verified: true,
  });

  const data = await newJob.save();
  const applyLink = `http://localhost:3000/jobdesc/${data._id}`;
  const data2 = await Job.findById(data._id);
  data2.applyLink = applyLink;
  const updatedJob = await data2.save();
  res.json({ job: updatedJob });
};

exports.fetchEmployeerJobs = async (req, res, next) => {
  const { userId } = req.user;
  const data = await Job.find({ creator: userId });
  res.json({ myJobs: data });
};

exports.createJobAlert = async (req, res, next) => {
  const { userId } = req.user;
  const { jobCategory, location, jobType } = req.body;

  const data = await User.findById(userId);
  const email = data.email;
  const newJobAlert = new JobRequest({
    jobCategory,
    location,
    jobType,
    email,
    user: userId,
  });
  const newData = await newJobAlert.save();
  res.json({ newData });
};

exports.deleteJob = async (req, res, next) => {
  console.log("delete");
  try {
    const jobId = req.params.jobId;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Optional: Add authentication check to ensure only creator can delete
    // if (job.creator.toString() !== req.user._id.toString()) {
    //     return res.status(403).json({
    //         success: false,
    //         message: 'Not authorized to delete this job'
    //     });
    // }

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};

exports.updateEmployeerJob = async (req, res, next) => {
  const jobId = req.params.jobId;
  console.log("update");
  try {
    const job = await Job.findById(jobId);

    if (!job) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      throw error;
    }

    // Update basic job fields
    job.jobTitle = req.body.jobTitle;
    job.jobCategory = req.body.jobCategory;
    job.location = req.body.location;
    job.salary = req.body.salary;
    job.jobType = req.body.jobType;
    job.jobDescription = req.body.jobDescription;

    // Update applicants array
    if (req.body.applicants && Array.isArray(req.body.applicants)) {
      // Map through existing applicants and update their status if found in request body
      job.applicants = job.applicants.map((applicant) => {
        const updatedApplicant = req.body.applicants.find(
          (a) => a._id.toString() === applicant._id.toString()
        );
        if (updatedApplicant) {
          return {
            ...applicant.toObject(),
            status: updatedApplicant.status,
          };
        }
        return applicant;
      });
    }

    const updatedJob = await job.save();

    res.status(200).json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// (Implement the  `extractScore`  and  `extractExplanation`  functions here)
function extractScore(responseText) {
  // Use a regular expression to find the score in the text
  const scoreMatch = responseText.match(/score\s*[:-]?\s*(\d+)/i);
  if (scoreMatch && scoreMatch[1]) {
    return parseInt(scoreMatch[1], 10);
  } else {
    // Handle cases where the score is not found
    console.warn("Score not found in response:", responseText);
    return null; // Or a default value, e.g., 0
  }
}

function extractExplanation(responseText) {
  // Split the response text into lines
  const lines = responseText.split("\n");

  // Find the line that starts with "Explanation:" (case-insensitive)
  const explanationLine = lines.find((line) =>
    line.toLowerCase().startsWith("explanation:")
  );

  if (explanationLine) {
    // Extract the explanation (remove "Explanation:" prefix)
    return explanationLine.substring(explanationLine.indexOf(":") + 1).trim();
  } else {
    // Handle cases where the explanation is not found
    console.warn("Explanation not found in response:", responseText);
    return null; // Or a default value, e.g., "No explanation provided."
  }
}

exports.applyForJob = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const jobId = req.body.jobId;
    const jobDescription = req.body.jobDescription;
    const resumeBuffer = req.file.buffer;

    const resumeContent = await pdfParse(resumeBuffer).then(
      (data) => data.text
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `Job Description: ${jobDescription}\nResume Content: ${resumeContent}\n\nBased on the provided job description and resume content, provide a score from 1 to 10 (1 being the least suitable and 10 being the most suitable) indicating how well the resume matches the job requirements. Also, provide a brief explanation for the given score.Give score in the form like this Score: 8 and after that start explanation like this Explanation:`;

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();

    const score = extractScore(responseText);
    const explanation = extractExplanation(responseText);

    const data = await User.findById(userId);

    const newData = {
      name: data.name,
      email: data.email,
      resumeScore: score,
      resumeSummary: explanation,
    };

    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId },
      { $push: { applicants: newData } }
    );

    console.log(updatedJob);

    res.json({ score, explanation });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to shortlist resume" });
  }
};
