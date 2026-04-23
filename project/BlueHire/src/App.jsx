import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5050/api";
const USER_STORAGE_KEY = "bluehireUser";

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function App() {
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadAppliedJobs(currentUser);
  }, [currentUser]);

  function getUserId(user = currentUser) {
    return user?.id || user?._id || "";
  }

  function getUserHeaders(user = currentUser) {
    const userId = getUserId(user);

    return userId ? { "X-User-Id": userId } : {};
  }

  async function loadJobs() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/jobs`);

      if (!response.ok) {
        throw new Error("Could not load jobs");
      }

      const data = await response.json();
      setJobs(data);
      setApiError("");
    } catch (error) {
      setApiError("Backend is not connected. Please start the Express server.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAppliedJobs(user = currentUser) {
    if (!getUserId(user)) {
      setAppliedJobs([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/applied-jobs`, {
        headers: getUserHeaders(user),
      });

      if (!response.ok) {
        throw new Error("Could not load applied jobs");
      }

      const data = await response.json();
      setAppliedJobs(data);
    } catch (error) {
      setAppliedJobs([]);
    }
  }

  async function handleAuthSubmit(mode, formData) {
    try {
      setMessage(mode === "signup" ? "Creating account..." : "Signing in...");
      setApiError("");

      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      setCurrentUser(data.user);
      setPage("home");
      setMessage(mode === "signup" ? "Account created successfully." : "Signed in successfully.");
    } catch (error) {
      setMessage("");
      setApiError(error.message || "Authentication failed.");
    }
  }

  function handleSignOut() {
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentUser(null);
    setAppliedJobs([]);
    setPage("home");
    setMessage("Signed out successfully.");
  }

  async function applyForJob(jobId) {
    if (!currentUser) {
      setMessage("Please sign in before applying.");
      setPage("signin");
      return;
    }

    try {
      setMessage("Applying for job...");

      const response = await fetch(`${API_URL}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getUserHeaders(),
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not apply for this job");
      }

      await loadAppliedJobs();
      setMessage("Job applied successfully.");
    } catch (error) {
      setMessage(error.message || "Could not apply. Please check if backend and MongoDB are running.");
    }
  }

  async function removeApplication(jobId) {
    if (!currentUser) {
      setMessage("Please sign in before removing an application.");
      setPage("signin");
      return;
    }

    try {
      setMessage("Removing application...");

      const response = await fetch(`${API_URL}/applications/${jobId}`, {
        method: "DELETE",
        headers: getUserHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not remove this application");
      }

      await loadAppliedJobs();
      setMessage("Application removed.");
    } catch (error) {
      setMessage(error.message || "Could not remove application. Please check if backend is running.");
    }
  }

  const appliedIds = appliedJobs
    .filter((item) => item.job)
    .map((item) => item.job._id);

  const filteredJobs = jobs.filter((job) => {
    const jobText = `${job.title} ${job.company} ${job.location} ${job.type}`;
    return jobText.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="app">
      <nav className="navbar">
        <button className="logo-button" onClick={() => setPage("home")}>
          <h2 className="logo">BlueHire</h2>
        </button>
        <div className="nav-links">
          <button
            className={page === "home" ? "active" : ""}
            onClick={() => setPage("home")}
          >
            Home
          </button>
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => {
              if (!currentUser) {
                setMessage("Please sign in to view your dashboard.");
                setPage("signin");
                return;
              }

              loadAppliedJobs();
              setPage("dashboard");
            }}
          >
            Dashboard
          </button>
          {currentUser ? (
            <>
              <span className="nav-user">{currentUser.name}</span>
              <button onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <>
              <button
                className={page === "signin" ? "active" : ""}
                onClick={() => setPage("signin")}
              >
                Sign In
              </button>
              <button
                className={page === "signup" ? "active" : ""}
                onClick={() => setPage("signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {page === "home" && (
        <HomePage
          jobs={filteredJobs}
          search={search}
          setSearch={setSearch}
          loading={loading}
          message={message}
          apiError={apiError}
          appliedIds={appliedIds}
          currentUser={currentUser}
          applyForJob={applyForJob}
          removeApplication={removeApplication}
        />
      )}

      {page === "dashboard" && (
        <DashboardPage
          jobsCount={jobs.length}
          appliedJobs={appliedJobs}
          currentUser={currentUser}
          message={message}
          removeApplication={removeApplication}
        />
      )}

      {(page === "signin" || page === "signup") && (
        <AuthPage
          mode={page}
          message={message}
          apiError={apiError}
          onSubmit={handleAuthSubmit}
          onSwitchMode={() => {
            setApiError("");
            setMessage("");
            setPage(page === "signin" ? "signup" : "signin");
          }}
        />
      )}

      <footer className="footer">BlueHire Job Portal - 2026</footer>
    </div>
  );
}

function HomePage({
  jobs,
  search,
  setSearch,
  loading,
  message,
  apiError,
  appliedIds,
  currentUser,
  applyForJob,
  removeApplication,
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="small-title">Simple Job Portal</p>
          <h1>Find Your Next Job Opportunity</h1>
          <p>
            Explore basic job listings from different companies. Sign in,
            apply for jobs, and manage your applications from the dashboard.
          </p>
          <button
            className="primary-btn"
            onClick={() => document.getElementById("jobs").scrollIntoView()}
          >
            Explore Jobs
          </button>
        </div>

        <div className="hero-card">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
            alt="People discussing job opportunities"
          />
          <h3>Quick Highlights</h3>
          <ul>
            <li>Create an account or sign in</li>
            <li>Apply and remove applications</li>
            <li>Applied jobs saved in MongoDB</li>
          </ul>
        </div>
      </section>

      <section className="section" id="jobs">
        <h2>Latest Job Opportunities</h2>
        <p className="section-text">Choose a role that matches your interest.</p>

        {apiError && <p className="error-message">{apiError}</p>}
        {message && <p className="success-message">{message}</p>}

        <input
          className="search-box"
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {loading ? (
          <p className="section-text">Loading jobs...</p>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isApplied={appliedIds.includes(job._id)}
                currentUser={currentUser}
                applyForJob={applyForJob}
                removeApplication={removeApplication}
              />
            ))}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <p className="section-text">No jobs found.</p>
        )}
      </section>
    </>
  );
}

function JobCard({ job, isApplied, currentUser, applyForJob, removeApplication }) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p className="company">{job.company}</p>
      <p>Location: {job.location}</p>
      <p>Salary: {job.salary}</p>
      <p>Type: {job.type}</p>

      <div className="skills">
        {job.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <button
        className={isApplied ? "outline-btn remove-btn" : "primary-btn"}
        onClick={() => {
          if (isApplied) {
            removeApplication(job._id);
            return;
          }

          applyForJob(job._id);
        }}
      >
        {isApplied ? "Remove" : currentUser ? "Apply" : "Apply"}
      </button>
    </div>
  );
}

function AuthPage({ mode, message, apiError, onSubmit, onSwitchMode }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const isSignup = mode === "signup";

  function handleChange(event) {
    setFormData((currentData) => ({
      ...currentData,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(mode, formData);
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <p className="small-title">{isSignup ? "Create Account" : "Welcome Back"}</p>
        <h1>{isSignup ? "Sign Up" : "Sign In"}</h1>
        <p className="section-text">
          {isSignup
            ? "Create your profile to start applying for jobs."
            : "Sign in to continue managing your job applications."}
        </p>

        {apiError && <p className="error-message">{apiError}</p>}
        {message && <p className="success-message">{message}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          <button className="primary-btn" type="submit">
            {isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <button className="link-btn" onClick={onSwitchMode}>
          {isSignup ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </div>
    </section>
  );
}

function DashboardPage({ jobsCount, appliedJobs, currentUser, message, removeApplication }) {
  if (!currentUser) {
    return (
      <section className="section">
        <h2>User Dashboard</h2>
        <p className="section-text">Please sign in to view your dashboard.</p>
      </section>
    );
  }

  const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";

  return (
    <section className="section">
      <h2>User Dashboard</h2>
      <p className="section-text">View your profile and applied jobs.</p>

      {message && <p className="success-message">{message}</p>}

      <div className="dashboard">
        <div className="profile-card">
          <div className="avatar">{initial}</div>
          <h2>{currentUser.name}</h2>
          <p>
            <b>Role:</b> {currentUser.role || "Job Seeker"}
          </p>
          <p>
            <b>Email:</b> {currentUser.email}
          </p>
          <p>
            <b>Location:</b> {currentUser.location || "Remote"}
          </p>
          <p>
            <b>Skills:</b> {currentUser.skills?.length ? currentUser.skills.join(", ") : "Not added"}
          </p>
          <button className="primary-btn">Edit Profile</button>
        </div>

        <div className="activity-card">
          <h3>My Job Activity</h3>
          <div className="stats">
            <div>
              <h2>{jobsCount}</h2>
              <p>Total Jobs</p>
            </div>
            <div>
              <h2>{appliedJobs.length}</h2>
              <p>Applied Jobs</p>
            </div>
            <div>
              <h2>1</h2>
              <p>Profile</p>
            </div>
          </div>

          <h3>Applied Jobs</h3>
          {appliedJobs.length === 0 && (
            <p className="section-text">You have not applied for any jobs yet.</p>
          )}

          {appliedJobs.filter((application) => application.job).map((application) => (
            <div className="saved-job" key={application._id}>
              <div>
                <h4>{application.job.title}</h4>
                <p>{application.job.company}</p>
                <p>
                  {application.job.location} - {application.status}
                </p>
              </div>
              <button
                className="outline-btn remove-btn"
                onClick={() => removeApplication(application.job._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default App;
