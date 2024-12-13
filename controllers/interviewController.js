const { google } = require("googleapis");
const { v4: uuid } = require("uuid");
const dayjs = require("dayjs");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
});

exports.auth = (req, res, next) => {
  if (oauth2Client.credentials && oauth2Client.credentials.access_token) {
    return res.send({ msg: "You have successfully logged in" });
  }
  // console.log(oauth2Client.credentials);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.send({ authUrl: url }); // Send the URL to frontend
};

exports.redirect = async (req, res, next) => {
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
};

exports.scheduleInterview = async (req, res, next) => {
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
};
