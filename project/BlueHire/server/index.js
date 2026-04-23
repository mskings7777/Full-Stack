const cors = require("cors");
const crypto = require("crypto");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job_portal";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "job_portal";
const allowedDevOrigins = [/^http:\/\/127\.0\.0\.1:517\d$/, /^http:\/\/localhost:517\d$/];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedDevOrigins.some((pattern) => pattern.test(origin))) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  })
);
app.use(express.json());

const jobSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    location: String,
    salary: String,
    type: String,
    skills: [String],
  },
  { timestamps: true }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: String,
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    status: {
      type: String,
      default: "Applied",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, job: 1 }, { unique: true });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    passwordSalt: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Job Seeker",
    },
    location: {
      type: String,
      default: "Remote",
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
const Application = mongoose.model("Application", applicationSchema);
const User = mongoose.model("User", userSchema);

const sampleJobs = [
  {
    title: "Frontend Developer",
    company: "TechBlue Solutions",
    location: "Remote",
    salary: "$55k - $70k",
    type: "Full Time",
    skills: ["HTML", "CSS", "React"],
  },
  {
    title: "Junior Web Developer",
    company: "Bright Apps",
    location: "Chicago",
    salary: "$42k - $55k",
    type: "Internship",
    skills: ["JavaScript", "HTML", "CSS"],
  },
  {
    title: "React Developer",
    company: "NextHire",
    location: "Austin",
    salary: "$65k - $85k",
    type: "Full Time",
    skills: ["React", "API", "Git"],
  },
  {
    title: "UI Designer",
    company: "Creative Cloud",
    location: "New York",
    salary: "$48k - $62k",
    type: "Full Time",
    skills: ["Figma", "CSS", "Design"],
  },
  {
    title: "Customer Support Executive",
    company: "HelpDesk Pro",
    location: "Remote",
    salary: "$35k - $45k",
    type: "Part Time",
    skills: ["Support", "Email", "Chat"],
  },
  {
    title: "Data Entry Assistant",
    company: "OfficeLine",
    location: "Boston",
    salary: "$30k - $38k",
    type: "Part Time",
    skills: ["Typing", "Excel", "Data"],
  },
];

async function seedJobs() {
  const count = await Job.countDocuments();

  if (count === 0) {
    await Job.insertMany(sampleJobs);
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createPasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

function isPasswordMatch(password, user) {
  const { hash } = createPasswordHash(password, user.passwordSalt);
  const storedHash = Buffer.from(user.passwordHash, "hex");
  const incomingHash = Buffer.from(hash, "hex");

  return (
    storedHash.length === incomingHash.length &&
    crypto.timingSafeEqual(storedHash, incomingHash)
  );
}

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    skills: user.skills,
  };
}

function getRequestUserId(req) {
  const userId = req.get("x-user-id");

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  return userId;
}

app.get("/api/jobs", async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: 1 });
  res.json(jobs);
});

app.get("/api/health", (req, res) => {
  res.json({
    api: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    databaseName: mongoose.connection.name,
  });
});

app.post("/api/auth/signup", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const { hash, salt } = createPasswordHash(password);
    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
    });

    res.status(201).json({
      message: "Account created successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    next(error);
  }
});

app.post("/api/auth/signin", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });

  if (!user || !isPasswordMatch(password, user)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Signed in successfully",
    user: toPublicUser(user),
  });
});

app.post("/api/apply", async (req, res) => {
  const { jobId } = req.body;
  const userId = getRequestUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Please sign in before applying" });
  }

  if (!jobId) {
    return res.status(400).json({ message: "Job id is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const job = await Job.findById(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const application = await Application.findOneAndUpdate(
    { userId, job: jobId },
    { $setOnInsert: { userId, job: jobId, status: "Applied" } },
    { returnDocument: "after", upsert: true }
  ).populate("job");

  res.status(201).json({
    message: "Job applied successfully",
    application,
  });
});

app.get("/api/applied-jobs", async (req, res) => {
  const userId = getRequestUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Please sign in to view applied jobs" });
  }

  const applications = await Application.find({ userId })
    .populate("job")
    .sort({ createdAt: -1 });

  res.json(applications);
});

app.delete("/api/applications/:jobId", async (req, res) => {
  const userId = getRequestUserId(req);
  const { jobId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Please sign in before removing applications" });
  }

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const application = await Application.findOneAndDelete({ userId, job: jobId });

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json({ message: "Application removed successfully" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

async function startServer() {
  await mongoose.connect(MONGO_URI, {
    dbName: MONGO_DB_NAME,
    serverSelectionTimeoutMS: 5000,
  });
  await seedJobs();

  app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
    console.log(`MongoDB connected to database: ${mongoose.connection.name}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start server");
  console.error(error.message);
  process.exit(1);
});
