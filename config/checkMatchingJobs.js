const Job = require("../models/jobModel");
const JobRequest = require("../models/jobRequestModel");
const nodemailer = require("nodemailer");

const maillist = ["shivam.anand.216@gmail.com"];

const checkMatchingJobs = () => {
  console.log("checking for matching jobs...");

  const sendEmail = async (email, job) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: "stellarshivam7@gmail.com",
        pass: "mvwyezpiyynccxpt",
      },
    });

    let info = await transporter.sendMail({
      from: '"TalentTrove" <stellarshivam7@gmail.com>',
      to: email,
      subject: "Testing, testing, 123",
      html: `
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Matched Jobs Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h1 style="margin-top: 0;">Matched Jobs Notification</h1>
              <p>We are excited to inform you about the following job that matched you requirements:</p>
              <ul style="list-style: none; padding: 0;">
                  <li style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                      <h2 style="margin-top: 0;">${job.jobTitle}</h2>
                      <h4>${job.companyName}</h4>
                      <p style="margin-bottom: 5px;">Location: ${job.location} </p>
                      <p style="margin-bottom: 5px;">JobType: ${job.jobType}</p>
                      <p style="margin-bottom: 5px;">Description: ${job.jobDescription}</p>
                      <p><a href="${job.applyLink}" style="text-decoration: none; color: #007bff;">View Job</a></p>
                  </li>
              </ul>
              <p>Best Regards,<br>TalentTrove Team</p>
              <!-- Beautiful Image -->
          </div>
      </body>
      </html>
    `,
    });

    console.log(info.messageId);
    console.log(info.accepted);
    console.log(info.rejected);
  };

  const jobChangeStream = Job.watch();

  jobChangeStream.on("change", async (change) => {
    if (change.operationType === "insert") {
      const newJob = change.fullDocument;
      // console.log(newJob);
      const matchingJobRequests = await JobRequest.find({
        location: newJob.location,
        jobCategory: newJob.jobCategory,
        jobType: newJob.jobType,
      });

      matchingJobRequests.forEach((request) => {
        sendEmail(request.email, newJob);
      });
    }
  });
};

module.exports = checkMatchingJobs;
