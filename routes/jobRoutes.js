const express = require("express");
const jobController = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer();

const router = express.Router();

router.get("/:keyword/:cities/:jobtype/:verified", jobController.fetchJobs);
router.get("/locations", jobController.fetchAllCities);
router.get("/jobdesc/:jobId", jobController.fetchJobDetails);
router.get("/appliedJobs", protect, jobController.appliedJobs);
router.post("/addToAppliedJob", protect, jobController.addToJobApplied);
router.post("/jobAlert", protect, jobController.createJobAlert);
router.post("/e1/createJob", protect, jobController.createJob);
router.get("/e1/myJobs", protect, jobController.fetchEmployeerJobs);
router.put(
  "/e1/myJobs/update/:jobId",
  protect,
  jobController.updateEmployeerJob
);
router.delete("/e1/myJobs/delete/:jobId", protect, jobController.deleteJob);

router.post(
  "/applyForJob",
  protect,
  upload.single("resume"),
  jobController.applyForJob
);
module.exports = router;
