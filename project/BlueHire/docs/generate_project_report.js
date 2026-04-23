const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.join(
  __dirname,
  "BlueHire_ProjectReport_ManpreetSingh_24BCS12215.pdf"
);

const doc = new PDFDocument({
  size: "A4",
  margin: 72,
  bufferPages: true,
  info: {
    Title: "BlueHire Job Portal - Project Report",
    Author: "Manpreet Singh (24BCS12215)",
    Subject: "Project Report",
    Keywords: "BlueHire, job portal, React, Express, MongoDB",
    CreationDate: new Date("2026-04-23T00:00:00+05:30"),
  },
});

doc.pipe(fs.createWriteStream(outputPath));

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;
const left = 72;
const right = pageWidth - 72;

function topAndBottomRule() {
  doc.save();
  doc.lineWidth(0.8).strokeColor("#d2d2d2");
  doc.moveTo(left - 20, 74).lineTo(right + 20, 74).stroke();
  doc.moveTo(left - 20, pageHeight - 62).lineTo(right + 20, pageHeight - 62).stroke();
  doc.restore();
}

function addPageNumber(pageNumber) {
  doc.font("Times-Roman").fontSize(10).fillColor("black");
  doc.text(String(pageNumber), 0, pageHeight - 54, {
    align: "center",
  });
}

function titlePage() {
  topAndBottomRule();

  doc.moveDown(3);
  doc.font("Times-Bold").fontSize(22).text("BLUEHIRE JOB PORTAL", {
    align: "center",
  });
  doc.moveDown(2);
  doc.font("Times-Bold").fontSize(18).text("A PROJECT REPORT", {
    align: "center",
  });
  doc.moveDown(1.6);
  doc.font("Times-BoldItalic").fontSize(15).text("Submitted by", {
    align: "center",
  });
  doc.moveDown(1.4);
  doc.font("Times-Bold").fontSize(16).text("MANPREET SINGH (24BCS12215)", {
    align: "center",
  });
  doc.moveDown(1.8);
  doc
    .font("Times-BoldItalic")
    .fontSize(14)
    .text("in partial fulfillment for the award of the degree of", {
      align: "center",
    });
  doc.moveDown(1.4);
  doc.font("Times-Bold").fontSize(15).text("BACHELOR OF ENGINEERING", {
    align: "center",
  });
  doc.moveDown(0.4);
  doc.font("Times-Bold").fontSize(13).text("IN", {
    align: "center",
  });
  doc.moveDown(0.6);
  doc.font("Times-Roman").fontSize(14).text("COMPUTER SCIENCE AND ENGINEERING", {
    align: "center",
  });

  const logoX = pageWidth / 2 - 120;
  const logoY = 475;
  doc.save();
  doc.rect(logoX, logoY, 240, 86).fill("#ffffff").stroke("#cfcfcf");
  doc.rect(logoX + 12, logoY + 12, 56, 56).fill("#b5161b");
  doc.rect(logoX + 82, logoY + 12, 146, 56).fill("#2d2d2d");
  doc.fillColor("white").font("Times-Bold").fontSize(11).text("CU", logoX + 28, logoY + 32, {
    width: 24,
    align: "center",
  });
  doc.font("Times-Bold").fontSize(16).text("CHANDIGARH", logoX + 92, logoY + 24, {
    width: 126,
    align: "center",
  });
  doc.text("UNIVERSITY", logoX + 92, logoY + 42, {
    width: 126,
    align: "center",
  });
  doc.restore();

  doc.moveDown(6.8);
  doc.font("Times-Bold").fontSize(14).text("Chandigarh University", {
    align: "center",
  });
  doc.moveDown(0.7);
  doc.font("Times-Roman").fontSize(13).text("April 2026", {
    align: "center",
  });

  addPageNumber(1);
}

function addSectionHeading(title, subtitle) {
  doc.font("Times-Bold").fontSize(19).text(title, {
    align: "center",
  });
  if (subtitle) {
    doc.moveDown(0.3);
    doc.font("Times-Italic").fontSize(11).text(subtitle, {
      align: "center",
    });
  }
  doc.moveDown(1.1);
}

function paragraph(text, options = {}) {
  doc.font(options.font || "Times-Roman").fontSize(options.size || 12).text(text, {
    align: options.align || "justify",
    lineGap: options.lineGap || 4,
  });
  doc.moveDown(options.after || 0.9);
}

function bulletList(items) {
  items.forEach((item) => {
    doc.font("Times-Roman").fontSize(12).text(`• ${item}`, {
      align: "justify",
      indent: 18,
      paragraphGap: 4,
      lineGap: 3,
    });
  });
  doc.moveDown(0.9);
}

function signatureRow(leftLabel, rightLabel) {
  const y = doc.y + 18;
  doc.moveTo(92, y).lineTo(250, y).stroke();
  doc.moveTo(pageWidth - 250, y).lineTo(pageWidth - 92, y).stroke();
  doc.font("Times-Roman").fontSize(11);
  doc.text(leftLabel, 92, y + 8, { width: 158, align: "center" });
  doc.text(rightLabel, pageWidth - 250, y + 8, { width: 158, align: "center" });
}

function addTable(headers, rows, widths) {
  const startX = left;
  let y = doc.y;
  const rowHeight = 28;

  doc.font("Times-Bold").fontSize(11);
  let x = startX;
  headers.forEach((header, index) => {
    const width = widths[index];
    doc.rect(x, y, width, rowHeight).stroke();
    doc.text(header, x + 6, y + 8, { width: width - 12, align: "center" });
    x += width;
  });

  y += rowHeight;
  doc.font("Times-Roman").fontSize(10.5);
  rows.forEach((row) => {
    x = startX;
    const height = 42;
    row.forEach((cell, index) => {
      const width = widths[index];
      doc.rect(x, y, width, height).stroke();
      doc.text(cell, x + 6, y + 8, {
        width: width - 12,
        align: index === 0 ? "left" : "justify",
      });
      x += width;
    });
    y += height;
  });

  doc.y = y + 10;
}

function addArchitectureDiagram() {
  const centerX = pageWidth / 2;
  const y = doc.y + 10;

  const boxes = [
    { x: centerX - 95, y, w: 190, h: 44, label: "React + Vite Frontend\n(Home, Auth, Dashboard)", fill: "#dcecff" },
    { x: centerX - 95, y: y + 82, w: 190, h: 44, label: "Express REST API\n(/jobs, /auth, /apply)", fill: "#e5f5e0" },
    { x: 98, y: y + 82, w: 135, h: 44, label: "localStorage\ncurrent user", fill: "#fff0d9" },
    { x: pageWidth - 233, y: y + 82, w: 135, h: 44, label: "MongoDB\nusers, jobs,\napplications", fill: "#ffe3e3" },
  ];

  boxes.forEach((box) => {
    doc.save();
    doc.roundedRect(box.x, box.y, box.w, box.h, 8).fillAndStroke(box.fill, "#6b6b6b");
    doc.restore();
    doc.font("Times-Bold").fontSize(11).fillColor("black").text(box.label, box.x + 8, box.y + 8, {
      width: box.w - 16,
      align: "center",
    });
  });

  doc.moveTo(centerX, y + 44).lineTo(centerX, y + 82).stroke();
  doc.moveTo(centerX - 95, y + 104).lineTo(233, y + 104).stroke();
  doc.moveTo(centerX + 95, y + 104).lineTo(pageWidth - 233, y + 104).stroke();
  doc.moveTo(centerX, y + 44).lineTo(centerX, y + 82).stroke();

  doc
    .font("Times-Italic")
    .fontSize(10.5)
    .text("Figure: High-level architecture of the BlueHire Job Portal", left, y + 142, {
      width: right - left,
      align: "center",
    });

  doc.y = y + 170;
}

function addTocLine(title, page) {
  const pageText = String(page);
  const titleWidth = 360;
  const y = doc.y;
  doc.font("Times-Roman").fontSize(12).text(title, left + 10, y, { width: titleWidth });
  doc.text(pageText, right - 20, y, { width: 20, align: "right" });
  doc
    .moveTo(left + 10 + doc.widthOfString(title) + 8, y + 10)
    .lineTo(right - 28, y + 10)
    .dash(1.5, { space: 2.5 })
    .strokeColor("#999999")
    .stroke()
    .undash()
    .strokeColor("black");
  doc.moveDown(0.8);
}

titlePage();

doc.addPage();
addSectionHeading("CERTIFICATE");
paragraph(
  "This is to certify that the project report entitled “BlueHire Job Portal” is a bona fide work carried out by Manpreet Singh (24BCS12215) in partial fulfillment of the requirements for the award of the degree of Bachelor of Engineering in Computer Science and Engineering at Chandigarh University during the academic session 2025-2026.",
  { after: 0.7 }
);
paragraph(
  "The work presented in this report is based on the design and implementation of a web-based job portal that allows users to register, sign in, browse available job opportunities, apply for roles, remove applications, and review their activity through a dashboard. The project integrates a React frontend, an Express backend, and MongoDB for data persistence.",
  { after: 0.7 }
);
paragraph(
  "To the best of our knowledge, this report has not been submitted in part or full to any other university or institution for the award of any degree or diploma.",
  { after: 1.2 }
);
signatureRow("Project Supervisor", "Student Signature");

doc.addPage();
addSectionHeading("ACKNOWLEDGEMENT");
paragraph(
  "I express my sincere gratitude to the faculty of the Department of Computer Science and Engineering, Chandigarh University, for providing the academic environment and guidance required to complete this project successfully."
);
paragraph(
  "I am thankful to all teachers, mentors, and lab staff whose suggestions helped in refining the structure, usability, and implementation approach of the BlueHire Job Portal. Their feedback was valuable in improving both the frontend experience and the backend data flow."
);
paragraph(
  "I would also like to acknowledge the official documentation of React, Vite, Express, Node.js, and MongoDB, which served as reliable technical references while building and organizing the application."
);
paragraph(
  "Finally, I thank my family and peers for their support, encouragement, and constructive discussions throughout the development of this project."
);

doc.addPage();
addSectionHeading("ABSTRACT");
paragraph(
  "BlueHire is a simple full-stack job portal designed to demonstrate the core workflow of a recruitment application. The system enables job seekers to create an account, sign in, explore available job roles, apply for positions, remove submitted applications, and monitor their profile activity through a personalized dashboard."
);
paragraph(
  "The frontend of the application is built using React and Vite to provide a responsive single-page experience. The backend is implemented using Express and Node.js, while MongoDB is used for storing users, job listings, and applications. The application also includes seeded sample jobs, secure password hashing using Node.js crypto utilities, CORS protection for development origins, and application-level validation for user actions."
);
paragraph(
  "The project focuses on clarity, usability, and a clean separation between interface logic and server-side processing. It is appropriate as an academic mini-project because it demonstrates user authentication, REST API interaction, persistent storage, search functionality, dashboard presentation, and fundamental full-stack architecture in a compact but meaningful way."
);

doc.addPage();
addSectionHeading("TABLE OF CONTENTS");
[
  ["Certificate", 2],
  ["Acknowledgement", 3],
  ["Abstract", 4],
  ["Introduction", 6],
  ["Objectives and Scope", 7],
  ["Existing System and Problem Statement", 8],
  ["Requirement Analysis", 9],
  ["System Architecture", 10],
  ["Database Design", 11],
  ["API Specification", 12],
  ["Frontend Implementation", 13],
  ["Backend Implementation", 14],
  ["Application Workflow", 15],
  ["Testing and Validation", 16],
  ["Results, Strengths and Limitations", 17],
  ["Conclusion and Future Scope", 18],
  ["References", 19],
  ["Appendix", 20],
].forEach(([title, page]) => addTocLine(title, page));

doc.addPage();
addSectionHeading("INTRODUCTION");
paragraph(
  "The employment process increasingly depends on digital platforms that connect recruiters and job seekers quickly. Even a basic job portal must solve several important tasks: user registration, session handling, listing management, persistent application tracking, and simple navigation across multiple screens."
);
paragraph(
  "BlueHire is developed as a compact demonstration of these tasks. The project provides an accessible interface where users can browse openings, search through job listings, register with an email address, sign in, apply to jobs, and remove applications when required. The design intentionally keeps the feature set focused so that the structure of the full-stack solution remains easy to understand."
);
paragraph(
  "From a software engineering perspective, the project is useful because it combines state management on the client side with REST-based communication, database modeling, validation, and basic security handling on the server side. The codebase is small but representative of a real web application pipeline."
);
bulletList([
  "React manages page state, form state, API calls, and client-side filtering.",
  "Express exposes routes for authentication, jobs, and application management.",
  "MongoDB stores users, jobs, and submitted applications persistently.",
  "The system separates frontend rendering from backend business logic.",
]);

doc.addPage();
addSectionHeading("OBJECTIVES AND SCOPE");
paragraph("The main objectives of the project are as follows:");
bulletList([
  "To design a simple and user-friendly job portal interface.",
  "To implement account creation and sign-in for job seekers.",
  "To store jobs and applications in MongoDB instead of browser-only storage.",
  "To allow each user to apply for jobs and manage existing applications.",
  "To demonstrate a complete frontend-backend-database integration workflow.",
]);
paragraph(
  "The scope of the project is limited to job seeker interactions. BlueHire does not currently implement recruiter-side posting, role-based administration, resume upload, interview scheduling, payment workflows, or analytics dashboards. This limited scope is intentional because it allows the application to focus on core CRUD operations, authentication flow, and a maintainable architecture suitable for academic evaluation."
);
paragraph(
  "Within this scope, the project successfully demonstrates a realistic mini-portal that can be extended later into a more advanced placement system."
);

doc.addPage();
addSectionHeading("EXISTING SYSTEM AND PROBLEM STATEMENT");
paragraph(
  "Many beginner-level job portal projects rely entirely on local browser storage, use hardcoded authentication, or do not preserve user actions across sessions. Such approaches are acceptable for interface demonstrations, but they do not reflect the architecture of a practical full-stack application."
);
paragraph(
  "The main problem addressed by BlueHire is the need for a simple portal where user identity and applications are not lost when the page refreshes or the browser closes. The system therefore introduces persistent storage through MongoDB and formal API routes through Express."
);
bulletList([
  "The application must support a distinct user account instead of anonymous interaction.",
  "The portal must track which jobs a signed-in user has already applied to.",
  "The system must prevent duplicate application entries for the same user and job.",
  "The backend must validate required data and return meaningful responses.",
]);
paragraph(
  "By solving these problems, the project moves beyond a static UI and becomes a structured full-stack web application."
);

doc.addPage();
addSectionHeading("REQUIREMENT ANALYSIS");
paragraph("The requirements for BlueHire can be grouped into functional and non-functional categories.");
addTable(
  ["Type", "Requirement"],
  [
    ["Functional", "Allow users to sign up, sign in, browse jobs, search jobs, apply to a job, remove an application, and view applied jobs in a dashboard."],
    ["Functional", "Seed a starter set of jobs when the database is empty so the portal is immediately usable during demonstration."],
    ["Non-functional", "Maintain a responsive and easy-to-understand user interface with clear feedback messages for loading, success, and errors."],
    ["Non-functional", "Persist all important records using MongoDB and expose data through a maintainable REST API using Express."],
  ],
  [120, 340]
);
paragraph("Software requirements:");
bulletList([
  "Node.js runtime",
  "Vite development server",
  "React and React DOM",
  "Express, Mongoose, dotenv, and cors",
  "MongoDB local instance or cloud connection through environment variables",
]);
paragraph("Hardware requirements:");
bulletList([
  "A standard personal computer or laptop",
  "Minimum 4 GB RAM for development purposes",
  "Internet connection if using a hosted MongoDB cluster",
]);

doc.addPage();
addSectionHeading("SYSTEM ARCHITECTURE");
paragraph(
  "BlueHire follows a three-layer architecture. The presentation layer is handled by the React frontend. The application layer is implemented through an Express server that processes requests, validates inputs, and communicates with the database. The persistence layer is provided by MongoDB through Mongoose models."
);
addArchitectureDiagram();
paragraph(
  "The frontend communicates with the backend using fetch calls. The backend identifies the active user by reading the custom X-User-Id request header after sign-in. Applied jobs are stored in a separate Application collection, which references both the user identifier and the selected job."
);

doc.addPage();
addSectionHeading("DATABASE DESIGN");
paragraph(
  "The backend defines three primary schemas: Job, Application, and User. These schemas are intentionally compact but sufficient for a working recruitment workflow."
);
addTable(
  ["Collection", "Key Fields"],
  [
    ["User", "name, email, passwordHash, passwordSalt, role, location, skills, timestamps"],
    ["Job", "title, company, location, salary, type, skills, timestamps"],
    ["Application", "userId, job reference, status, timestamps, unique index on userId + job"],
  ],
  [120, 340]
);
paragraph(
  "The User collection stores normalized email addresses and derived password data instead of raw passwords. The Job collection holds sample opportunities. The Application collection links a user to a job and stores the application status. A compound unique index ensures that the same user cannot apply to the same job more than once."
);

doc.addPage();
addSectionHeading("API SPECIFICATION");
paragraph(
  "The server exposes a compact REST interface under the /api prefix. Each route has a clear responsibility and returns JSON responses that the React frontend can interpret easily."
);
addTable(
  ["Route", "Purpose"],
  [
    ["GET /api/jobs", "Returns the list of available jobs sorted by creation order."],
    ["GET /api/health", "Reports API and database connection status for quick diagnostics."],
    ["POST /api/auth/signup", "Creates a new user after validating name, email, and password length."],
    ["POST /api/auth/signin", "Authenticates an existing user and returns public user data."],
    ["POST /api/apply", "Creates an application for the current user and selected job."],
    ["GET /api/applied-jobs", "Returns all applied jobs for the signed-in user."],
    ["DELETE /api/applications/:jobId", "Removes an existing application for the current user."],
  ],
  [160, 300]
);
paragraph(
  "This API set is sufficient to support the entire visible user flow of the application without introducing unnecessary complexity."
);

doc.addPage();
addSectionHeading("FRONTEND IMPLEMENTATION");
paragraph(
  "The frontend is implemented in React using a single-page structure. The main App component manages page transitions, search input, fetched job data, current user state, loading indicators, feedback messages, and applied job tracking."
);
bulletList([
  "HomePage displays the hero section, search input, status messages, and job cards.",
  "AuthPage handles sign-up and sign-in modes with shared form logic.",
  "DashboardPage shows the active user profile and the list of applied jobs.",
  "JobCard changes its action button based on whether the user has already applied.",
]);
paragraph(
  "The application stores the authenticated user in localStorage under the key bluehireUser. On startup, the stored user is restored safely through a parsing helper. Search is implemented by filtering job title, company, location, and type text on the client side. This keeps the interaction responsive for a small dataset."
);

doc.addPage();
addSectionHeading("BACKEND IMPLEMENTATION");
paragraph(
  "The backend is built with Express and Mongoose. It uses middleware for CORS and JSON parsing, and it loads configuration values through dotenv. If no environment file is provided, the application connects to a local MongoDB instance using sensible defaults."
);
bulletList([
  "Password hashing is implemented with crypto.pbkdf2Sync and a unique per-user salt.",
  "Password verification uses timingSafeEqual to reduce comparison timing leakage.",
  "Request validation checks for missing fields, invalid identifiers, and duplicate accounts.",
  "Job seeding runs automatically when the database starts empty.",
  "Error handling returns clear JSON messages for both expected and unexpected failures.",
]);
paragraph(
  "The backend also restricts development CORS access to localhost and 127.0.0.1 origins on Vite ports, which keeps the setup practical without opening it broadly during development."
);

doc.addPage();
addSectionHeading("APPLICATION WORKFLOW");
paragraph("The operational workflow of BlueHire is straightforward and can be summarized as follows:");
bulletList([
  "The server starts, connects to MongoDB, and seeds sample jobs if needed.",
  "The frontend loads and requests available jobs from the backend API.",
  "A new user signs up or an existing user signs in through the auth routes.",
  "The frontend stores the returned public user object in localStorage.",
  "The signed-in user applies to a job by sending a POST request with the job identifier.",
  "The dashboard fetches applied jobs through the signed-in user header.",
  "The user may remove an application using the corresponding DELETE route.",
]);
paragraph(
  "This workflow demonstrates a complete request-response lifecycle, including persistence, retrieval, update of UI state, and controlled deletion."
);
paragraph(
  "Because the application separates concerns properly, each stage of the workflow can be debugged and extended independently."
);

doc.addPage();
addSectionHeading("TESTING AND VALIDATION");
paragraph(
  "The project was validated through route-level checks, UI interaction testing, and data persistence verification. Formal automated tests are not included in the current version, but the implemented behaviors can be validated reliably through manual test cases."
);
addTable(
  ["Test Case", "Expected Result"],
  [
    ["Create a new account", "A valid user is stored in MongoDB and the frontend reports successful account creation."],
    ["Sign in with valid credentials", "The user is authenticated and the dashboard becomes accessible."],
    ["Apply to a job", "A new application record is created and the job card state updates to Remove."],
    ["Apply twice to the same job", "The unique application rule prevents duplicate records."],
    ["Remove an application", "The selected application is deleted and the dashboard list refreshes."],
    ["Open portal without backend", "The UI displays an informative backend connection error message."],
  ],
  [160, 300]
);
paragraph(
  "These tests confirm that the core system responsibilities are working as intended."
);

doc.addPage();
addSectionHeading("RESULTS, STRENGTHS AND LIMITATIONS");
paragraph("The final outcome of the project is a working job portal with persistent account and application management. The major strengths of the system are:");
bulletList([
  "Clear full-stack separation between UI, API logic, and database storage.",
  "Persistent applications stored in MongoDB instead of temporary browser-only data.",
  "Simple and understandable code organization suitable for academic presentation.",
  "Basic security awareness through password hashing and safe password comparison.",
]);
paragraph("The current limitations are also important to note:");
bulletList([
  "No recruiter or admin panel is available for posting and managing jobs.",
  "No JWT or session-token based authentication is implemented yet.",
  "No resume upload, filtering by category, or recommendation engine is included.",
  "Automated unit and integration tests are not yet part of the codebase.",
]);

doc.addPage();
addSectionHeading("CONCLUSION AND FUTURE SCOPE");
paragraph(
  "BlueHire successfully meets the objective of building a compact, database-backed job portal using modern web development tools. The project demonstrates registration, login, listing retrieval, application submission, application removal, dashboard presentation, and persistent storage in a cohesive manner."
);
paragraph(
  "As an academic project, it provides a practical example of how frontend and backend systems cooperate to deliver a meaningful user workflow. The implementation is simple enough for explanation yet complete enough to represent a real application pattern."
);
paragraph("The future scope of the project includes the following improvements:");
bulletList([
  "Recruiter dashboard for adding, editing, and deleting job postings",
  "Role-based authentication and authorization",
  "Resume upload and profile enrichment",
  "Search filters based on skills, salary, and location",
  "Interview scheduling, notifications, and email integration",
  "Automated tests and deployment configuration",
]);

doc.addPage();
addSectionHeading("REFERENCES");
[
  "React Documentation. Meta Open Source. https://react.dev/",
  "Vite Documentation. https://vite.dev/",
  "Express Documentation. https://expressjs.com/",
  "Node.js Documentation. https://nodejs.org/",
  "MongoDB Manual. https://www.mongodb.com/docs/",
  "Mongoose Documentation. https://mongoosejs.com/docs/",
  "Project source files and implementation available in the BlueHire codebase submitted with this report.",
].forEach((reference, index) => {
  doc.font("Times-Roman").fontSize(12).text(`${index + 1}. ${reference}`, {
    align: "justify",
    lineGap: 4,
    paragraphGap: 8,
  });
});

doc.addPage();
addSectionHeading("APPENDIX");
paragraph("Important project files included in the submitted work:");
doc.font("Courier").fontSize(11).text(
  [
    "BlueHire/",
    "├── src/",
    "│   ├── App.jsx",
    "│   ├── App.css",
    "│   └── main.jsx",
    "├── server/",
    "│   └── index.js",
    "├── README.md",
    "├── package.json",
    "└── docs/",
    "    ├── DinosaurGame_ProjectReport.pdf",
    "    ├── generate_project_report.js",
    "    └── BlueHire_ProjectReport_ManpreetSingh_24BCS12215.pdf",
  ].join("\n"),
  {
    lineGap: 3,
  }
);
doc.moveDown(1.3);
paragraph(
  "This appendix shows the compact nature of the project. The application logic is concentrated primarily in one React entry component and one Express server file, which makes the code easy to inspect and discuss during evaluation.",
  { font: "Times-Roman", size: 12 }
);

const range = doc.bufferedPageRange();
for (let index = 0; index < range.count; index += 1) {
  doc.switchToPage(index);
  if (index > 0) {
    topAndBottomRule();
    addPageNumber(index + 1);
  }
}

doc.end();

console.log(`Created ${outputPath}`);
console.log(`Pages: ${range.count}`);
