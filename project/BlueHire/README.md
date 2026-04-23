# BlueHire Job Portal

A simple React job portal with an Express and MongoDB backend.

## Features

- Home page with job opportunities
- Signup and signin pages
- Apply button for jobs that are not applied
- Remove button for jobs the signed-in user has already applied to
- Applications are saved in MongoDB, not browser localStorage
- Dashboard shows jobs applied by the signed-in user

## Run The Project

Install dependencies:

```bash
npm install
```

Start MongoDB locally:

```bash
mongod
```

Start the backend:

```bash
npm run server
```

Start the React frontend in another terminal:

```bash
npm run client
```

Open:

```text
http://127.0.0.1:5173/
```

## Environment

Create a `.env` file to use your MongoDB connection. Without `.env`, the backend uses local MongoDB at `mongodb://127.0.0.1:27017/job_portal`.

```bash
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/job_portal?appName=<app-name>
MONGO_DB_NAME=job_portal
PORT=5050
VITE_API_URL=http://127.0.0.1:5050/api
```

The frontend stores the signed-in user in `localStorage`; jobs and applications are still read and saved through the Express API and MongoDB.
