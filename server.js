const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { google } = require("googleapis");
const { v4: uuid } = require("uuid");
const dayjs = require("dayjs");

const dotenv = require("dotenv");
const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");
const scheduleInterviewRoutes = require("./routes/scheduleInterviewRoutes");
const scrapeData = require("./config/scrapeJobs");
const checkMatchingJobs = require("./config/checkMatchingJobs");

const app = express();
dotenv.config();
connectDB();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
});

const scopes = ["https://www.googleapis.com/auth/calendar"];
// scrapeData.scrapeIndeed();
// scrapeData.scrapeNaukri();
// scrapeData.scrapeInternshalaJobs();
// scrapeData.scrapeInternshalaIntern();
checkMatchingJobs();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT,PATCH");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });

app.use("/api/jobs", jobRoutes);
app.use("/api/users", authRoutes);
// app.use("/google", scheduleInterviewRoutes);

app.get("/google", async (req, res, next) => {
  if (oauth2Client.credentials && oauth2Client.credentials.access_token) {
    return res.send({ msg: "You have successfully logged in" });
  }
  // console.log(oauth2Client.credentials);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.send({ authUrl: url }); // Send the URL to frontend
});

// Route to handle Google sign-in redirect
app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log(oauth2Client.credentials);
    res.send({ msg: "You have successfully logged in" });
  } catch (error) {
    console.error("Error during Google authentication:", error);
    res.status(500).send({ error: "Authentication failed" });
  }
});

// Route to schedule an interview event
app.post("/schedule_event", async (req, res) => {
  const { summary, description, start, end, participants } = req.body;

  try {
    const result = await calendar.events.insert({
      calendarId: "primary",
      auth: oauth2Client,
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        description,
        start: {
          dateTime: dayjs(start).toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: dayjs(end).toISOString(),
          timeZone: "Asia/Kolkata",
        },
        conferenceData: {
          createRequest: {
            requestId: uuid(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        attendees: participants.map((participant) => ({ email: participant })),
      },
    });
    console.log(result);
    res.send({ msg: "Interview scheduled successfully" });
  } catch (error) {
    console.error("Error scheduling event:", error);
    res.status(500).send({ error: "Error scheduling event" });
  }
});

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

const PORT = process.env.PORT;

app.listen(3002, console.log(`Server started at ${PORT}`));

// kjhgfgh
//main-push
// lkjhgf

// jhgf
