const express = require("express");
const interviewController = require("../controllers/interviewController");

const router = express.Router();

router.get("/auth", interviewController.auth);

router.post("/redirect", interviewController.redirect);

router.post("/schedule_event", interviewController.scheduleInterview);

module.exports = router;
