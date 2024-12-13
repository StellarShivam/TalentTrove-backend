const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const Job = require("../models/jobModel");

const jobCategories = [
  "machine-learning",
  // "machine-learning-intern",
  "artificial-intelligence",
  // "artificial-intelligence-intern",
  "devops",
  // "devops-intern",
  "web-developer",
  // "web-developer-intern",
  "frontend-developer",
  // "frontend-developer-intern",
  "backend-developer",
  // "backend-developer-intern",
  "full-stack-developer",
  // "full-stack-developer-intern",
  "software-developer",
  // "software-developer-intern",
  "app-developer",
  // "app-developer-intern",
  "data-analyst",
  "data-science",
];

const jobCategoriesInternshala = [
  "machine-learning",
  "artificial-intelligence",
  "devops",
  "web-development",
  "front-end-development",
  "backend-development",
  "full-stack-development",
  "software-development",
  "android-app-development",
  "ios-app-development",
  "data-analytics",
  "data-science",
];

const createIndeedScrapeLinks = (jobCategories) => {
  let categoryLinks = [];
  for (var i = 0; i < jobCategories.length; i++) {
    for (var j = 0; j <= 1; j++) {
      let string1 = jobCategories[i].replaceAll("-", "+");
      let url =
        j == 0
          ? `https://in.indeed.com/jobs?q=${string1}&vjk=d57f451cc6e04f1b`
          : `https://in.indeed.com/jobs?q=${string1}&start=${
              j * 10
            }&vjk=802b313c23212cd6`;
      categoryLinks.push({ url, jobCategory: jobCategories[i] });
    }
  }
  return categoryLinks;
};

const createInternshalaJobsLinks = (jobCategories) => {
  let categoryLinks = [];
  for (var i = 0; i < jobCategories.length; i++) {
    for (var j = 1; j <= 1; j++) {
      let url = `https://internshala.com/jobs/${jobCategories[i]}-jobs/page-${j}/`;
      categoryLinks.push({ url, jobCategory: jobCategories[i] });
    }
  }
  return categoryLinks;
};

const createInternshalaInternLinks = (jobCategories) => {
  let categoryLinks = [];
  for (var i = 0; i < jobCategories.length; i++) {
    for (var j = 1; j <= 1; j++) {
      let url = `https://internshala.com/internships/${jobCategories[i]}-internship/page-${j}/`;
      categoryLinks.push({ url, jobCategory: jobCategories[i] });
    }
  }
  return categoryLinks;
};

const createNaurkiScrapeLinks = (jobCategories) => {
  let categoryLinks = [];
  for (var i = 0; i < jobCategories.length; i++) {
    for (var j = 1; j <= 2; j++) {
      let string1 = jobCategories[i] + "-jobs-" + `${j}`;
      let string2 = jobCategories[i].replaceAll("-", "%20");
      let url = `https://www.naukri.com/${string1}?k=${string2}&experience=0&qproductJobSource=2&naukriCampus=true&experience=0&nignbevent_src=jobsearchDeskGNB`;
      categoryLinks.push({ url, jobCategory: jobCategories[i] });
    }
    // https://www.naukri.com/machine-learning-jobs?k=machine%20learning&experience=0&qproductJobSource=2&naukriCampus=true&experience=0&nignbevent_src=jobsearchDeskGNB
  }
  return categoryLinks;
};

const scrapeIndeedPage = async (job, page) => {
  try {
    await page.goto(job.url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    let jobs = $(".jobTitle > a")
      .map((i, element) => {
        return {
          url: "https://in.indeed.com" + $(element).attr("href"),
          jobCategory: job.jobCategory,
        };
      })
      .get();

    const posted = $("span.css-1yxm164.eu4oa1w0 > span")
      .map((i, element) => {
        jobs[i].posted = $(element).last().text();
      })
      .get();
    return jobs;
  } catch (e) {
    console.error(e);
  }
};

const scrapeInternshalaJobPage = async (job, page) => {
  try {
    await page.goto(job.url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const jobs = $("#internship_list_container_1>div")
      .map((i, element) => {
        return {
          url: "https://internshala.com" + $(element).attr("data-href"),
          jobCategory: job.jobCategory,
        };
      })
      .get();
    return jobs;
  } catch (e) {
    console.error(e);
  }
};

const scrapeInternshalaInternPage = async (job, page) => {
  try {
    await page.goto(job.url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const jobs = $("div.button_container_card > div > a")
      .map((i, element) => {
        return {
          url: "https://internshala.com" + $(element).attr("href"),
          jobCategory: job.jobCategory,
        };
      })
      .get();
    return jobs;
  } catch (e) {
    console.error(e);
  }
};

const scrapeNaukriPage = async (job, page) => {
  try {
    await page.goto(job.url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const jobs = $(".title")
      .map((i, element) => {
        return { url: $(element).attr("href"), jobCategory: job.jobCategory };
      })
      .get();
    return jobs;
  } catch (e) {
    console.error(e);
  }
};

const scrapeIndeedDescriptionPage = async (jobs, page) => {
  try {
    await page.goto(jobs.url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    let jobTitle = $(
      "#viewJobSSRRoot > div > div > div > div > div > div > div:nth-child(1) > div > h1 > span"
    )
      .first()
      .text();
    const regex = /\.css.*/;
    let tempTitle = jobTitle.replace(regex, "");
    jobTitle = tempTitle;

    let companyName = $(
      "#viewJobSSRRoot > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > span > a"
    ).text();
    let tempComany = companyName.replace(regex, "");
    companyName = tempComany;
    console.log(companyName);

    let location = $("#jobLocationText > div > span").text();
    let loc = location.split(", ");
    if (loc.length == 3) {
      location = [loc[1]];
    } else if (loc.length == 2) {
      location = [loc[0]];
    } else {
      location = [loc[0]];
    }
    let applyLink = $("#applyButtonLinkContainer > div > div > button").attr(
      "href"
    );
    if (!applyLink) {
      applyLink = jobs.url;
    }
    const jobDescription = $("#jobDescriptionText").text();
    const textLines = jobDescription.split("\n");
    const cleanText = textLines.join(" ");

    let jobType = $(
      "#jobDetailsSection > div > div > div > div > div > ul > li > div > div > div:nth-child(1)"
    ).text();

    const lowerStr1 = jobType.toLowerCase();
    const lowerStr2 = jobTitle.toLowerCase();

    if (
      lowerStr1.includes("intern") ||
      lowerStr1.includes("internship") ||
      lowerStr2.includes("intern") ||
      lowerStr2.includes("internship")
    ) {
      jobType = "Internship";
    } else {
      jobType = "Fulltime";
    }
    console.log(jobs);
    let temp = jobs.posted.split(" ");
    temp.shift();
    let jobPosted = temp.join(" ");
    if (jobPosted === "") {
      jobPosted = "Today";
    }

    const newJob = new Job({
      logo: "",
      jobCategory: jobs.jobCategory,
      jobTitle,
      companyName,
      location,
      jobType,
      jobPosted,
      jobDescription: cleanText,
      applyLink,
    });

    await newJob.save();

    // console.log({
    //   jobCategory: jobs.jobCategory,
    //   jobTitle,
    //   companyName,
    //   location,
    //   jobType,
    //   jobPosted: jobPosted,
    //   jobDescription: cleanText,
    //   applyLink,
    // });
  } catch (e) {
    console.error(e);
  }
};

const scrapeNaukriDescriptionPage = async (jobs, page) => {
  try {
    await page.goto(jobs.url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    const jobTitle = $(
      "#job_header > div.styles_jhc__top__BUxpc > div.styles_jhc__jd-top-head__MFoZl > header > h1"
    ).text();
    const companyName = $(
      "#job_header > div.styles_jhc__top__BUxpc > div.styles_jhc__jd-top-head__MFoZl > div > a"
    ).text();
    const location = $(
      "#job_header > div.styles_jhc__top__BUxpc > div.styles_jhc__left__tg9m8 > div.styles_jhc__loc___Du2H > span"
    ).text();
    const applyLink = jobs.url;
    const jobDescription = $(
      "#root > div > main > div.styles_jdc__content__EZJMQ > div.styles_left-section-container__btAcB > section.styles_job-desc-container__txpYf"
    ).text();
    const textLines = jobDescription.split("\n");
    const cleanText = textLines.join(" ");

    let jobType = $(
      "#job_header > div.styles_jhc__top__BUxpc > div.styles_jhc__left__tg9m8 > div.styles_jhc__exp-salary-container__NXsVd"
    ).text();

    const newJob = new Job({
      logo: "",
      jobCategory: jobs.jobCategory,
      jobTitle,
      companyName,
      location,
      jobType: "Fulltime",
      jobPosted: "",
      jobDescription: cleanText,
      applyLink,
    });

    await newJob.save();
  } catch (e) {
    console.error(e);
  }
};

const trimString = (input) => {
  return input.trim();
};

const scrapeIntershalaJobDescriptionPage = async (job, page) => {
  try {
    await page.goto(job.url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    let jobTitle = $(
      "div.internship_meta > div.individual_internship_header > div.company > div.heading_4_5.profile"
    )
      .first()
      .text();
    let companyName = $("div.heading_6.company_name").first().text();
    jobTitle = trimString(jobTitle);
    companyName = trimString(companyName);
    const location = $("#location_names > span > a").first().text().split(", ");
    const applyLink = job.url;
    const jobDescription = $(
      "#details_container > div.detail_view > div.internship_details > div:nth-child(2)"
    ).text();
    const textLines = jobDescription.split("\n");
    const cleanText = textLines.join(" ");

    let jobType = $(
      "#job_header > div.styles_jhc__top__BUxpc > div.styles_jhc__left__tg9m8 > div.styles_jhc__exp-salary-container__NXsVd"
    ).text();
    jobType = "Fulltime";

    let logo = $(
      "div.internship_meta > div.individual_internship_header > div.internship_logo > img"
    )
      .first()
      .attr("src");
    if (!logo) {
      logo = "";
    }

    const jobPosted = $(
      "div.internship_meta > div.tags_container_outer > div.posted_by_container > div > div > div"
    )
      .first()
      .text();

    const newJob = new Job({
      logo,
      jobCategory: job.jobCategory,
      jobTitle,
      companyName,
      location,
      jobType: "Fulltime",
      jobPosted,
      jobDescription: cleanText,
      applyLink,
    });

    await newJob.save();

    console.log({
      logo,
      jobCategory: job.jobCategory,
      jobTitle,
      companyName,
      location,
      jobType,
      jobPosted,
      jobDescription: cleanText,
      applyLink,
    });
  } catch (e) {
    console.error(e);
  }
};

const scrapeIntershalaInternDescriptionPage = async (job, page) => {
  try {
    await page.goto(job.url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    let jobTitle = $(
      "div.internship_meta > div.individual_internship_header > div.company > div.heading_4_5.profile"
    )
      .first()
      .text();
    let companyName = $("div.heading_6.company_name").first().text();
    jobTitle = trimString(jobTitle);
    companyName = trimString(companyName);
    const location = $("#location_names > span > a").first().text().split(", ");
    const applyLink = job.url;
    const jobDescription = $(
      "#details_container > div.detail_view > div.internship_details > div:nth-child(2)"
    ).text();
    const textLines = jobDescription.split("\n");
    const cleanText = textLines.join(" ");

    let jobType = $(
      "#job_header > div.styles_jhc__top__BUxpc > div.styles_jhc__left__tg9m8 > div.styles_jhc__exp-salary-container__NXsVd"
    ).text();
    jobType = "Internship";

    let logo = $(
      "div.internship_meta > div.individual_internship_header > div.internship_logo > img"
    )
      .first()
      .attr("src");
    if (!logo) {
      logo = "";
    }

    const jobPosted = $(
      "div.internship_meta > div.tags_container_outer > div.posted_by_container > div > div > div"
    )
      .first()
      .text();

    const newJob = new Job({
      logo,
      jobCategory: job.jobCategory,
      jobTitle,
      companyName,
      location,
      jobType,
      jobPosted,
      jobDescription: cleanText,
      applyLink,
    });

    await newJob.save();

    console.log({
      logo,
      jobCategory: job.jobCategory,
      jobTitle,
      companyName,
      location,
      jobType,
      jobPosted,
      jobDescription: cleanText,
      applyLink,
    });
  } catch (e) {
    console.error(e);
  }
};

const scrapeIndeed = async () => {
  let browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  let jobs = [];

  let categoryLinks = createIndeedScrapeLinks(jobCategories);

  for (var i = 0; i < categoryLinks.length; i++) {
    let temp = await scrapeIndeedPage(categoryLinks[i], page);
    jobs = [...jobs, ...temp];
  }

  for (var i = 0; i < jobs.length; i++) {
    await scrapeIndeedDescriptionPage(jobs[i], page);
  }
  await browser.close();
};

const scrapeNaukri = async () => {
  let browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  let jobs = [];

  let categoryLinks = createNaurkiScrapeLinks(jobCategories);
  // console.log(categoryLinks);

  for (var i = 0; i < categoryLinks.length; i++) {
    let temp = await scrapeNaukriPage(categoryLinks[i], page);
    jobs = [...jobs, ...temp];
  }
  console.log(jobs);
  for (var i = 0; i < jobs.length; i++) {
    await scrapeNaukriDescriptionPage(jobs[i], page);
  }
  // console.log(jobs);
};

const scrapeInternshalaJobs = async () => {
  let browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  let jobs = [];

  let categoryLinks = createInternshalaJobsLinks(jobCategoriesInternshala);

  for (var i = 0; i < categoryLinks.length; i++) {
    let temp = await scrapeInternshalaJobPage(categoryLinks[i], page);
    jobs = [...jobs, ...temp];
  }
  // console.log(jobs);
  for (var i = 0; i < jobs.length; i++) {
    await scrapeIntershalaJobDescriptionPage(jobs[i], page);
  }
  //   console.log(jobs);
  await browser.close();
};

const scrapeInternshalaIntern = async () => {
  let browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  let jobs = [];
  let categoryLinks = createInternshalaInternLinks(jobCategoriesInternshala);
  for (var i = 0; i < categoryLinks.length; i++) {
    let temp = await scrapeInternshalaInternPage(categoryLinks[i], page);
    jobs = [...jobs, ...temp];
  }
  for (var i = 0; i < jobs.length; i++) {
    await scrapeIntershalaInternDescriptionPage(jobs[i], page);
  }
  // await Job.deleteMany({});
  await browser.close();
};

module.exports = {
  scrapeIndeed,
  scrapeInternshalaIntern,
  scrapeInternshalaJobs,
  scrapeNaukri,
};
