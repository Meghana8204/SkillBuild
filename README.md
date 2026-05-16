SkillBridge Attendance Management System

SkillBridge is a full-stack attendance management system for a multi-role skilling programme. It supports five roles with separate dashboards and permission-aware APIs:

- student
- trainer
- institution
- programme_manager
- monitoring_officer

This repository contains:

- frontend/: React + Vite client
- backend/: Express + MongoDB API

1. Live URLs

- Frontend live URL: not found in the repository configuration
- Backend live URL: `https://skillbuild-backend.onrender.com`
- API base URL: `https://skillbuild-backend.onrender.com/api`
- Local frontend URL: `http://localhost:5173`
- Local backend URL: `http://localhost:5000`
- Local API base URL: `http://localhost:5000/api`

Note: the deployed backend URL is confirmed from [frontend/src/services/api.js](frontend/src/services/api.js), where the frontend currently uses:

baseURL: "https://skillbuild-backend.onrender.com/api"

2. Test Accounts

No shared test/demo accounts are stored in this repository, and there is no seed script that creates fixed users automatically.
Because signup is enabled in the app, the practical way to test all five roles is to create one account per role through the UI:

- Student: create via /login (meghanaar222@gmail.com && 12345678)
- Trainer: create via /login (trainer@gmail.com && 12345678)
- Institution: create via /login (navkis@gmail.com && 12345678)
- Programme Manager: create via /login (programmer@gmail.com && 12345678)
- Monitoring Officer: create via /login (monitor@gmail.com && 12345678)

Important behavior:

- A trainer must select an existing institution during signup.
- A student can sign up directly, but batch membership is completed through the invite link flow.
- Institution users create their own institution identity.


3. Local Setup Instructions

Prerequisites

- Node.js 18+
- npm
- MongoDB local instance or MongoDB Atlas

Backend setup

1. Go to the backend folder:

cd backend

2. Install dependencies:

npm install


3. Create backend/.env with:

env
MONGO_URI=mongodb://127.0.0.1:27017/skillbridge
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
INVITE_JWT_SECRET=your_invite_secret
INVITE_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
PORT=5000
NODE_ENV=development


4. Start the backend:

node server.js

The API runs at http://localhost:5000.

Frontend setup

1. Go to the frontend folder:

bash
cd frontend

2. Install dependencies:

bash
npm install


3. Update [frontend/src/services/api.js](frontend/src/services/api.js) for local development:

baseURL: "http://localhost:5000/api"


4. Start the frontend:

bash
npm run dev

The app runs at `http://localhost:5173`.

5. Schema Decisions

The backend uses a small relational-style design on top of MongoDB collections.

- User
  Stores name, email, hashed password, role, and institutionId. Institution users point institutionId to themselves so the same field can consistently represent institutional ownership across the system.

- Batch
  Stores the batch name and owning institutionId. This makes it easy to query batches by institution and enforce access rules.

- BatchTrainer
  A separate mapping collection between trainers and batches. I kept this separate instead of embedding trainer IDs inside batches so trainer assignment logic stays flexible and permission checks stay simple.

- BatchStudentInvite
  Stores approved student email addresses for a batch before the student joins. This supports the invite-only onboarding flow and prevents any student with a link from joining unless their email was pre-approved.

- BatchStudent
  Stores actual student membership in a batch after invite acceptance. Keeping this separate from invitations avoids mixing pending access with confirmed membership.

- Session
  Stores scheduled class sessions with batchId, trainerId, date, and time range. Sessions are tied to a batch and a trainer so reporting and ownership checks are straightforward.

- Attendance
  Stores one attendance record per studentId and sessionId, with a unique compound index. This prevents duplicate attendance rows for the same student/session pair.

6. Stack Choices And Why

 Frontend

- React 19
  Chosen for component-based UI and route-based dashboards.

- Vite
  Used for fast local development and simple frontend setup.

- React Router
  Used for role-based route protection and dashboard navigation.

- Axios
  Used for API calls and token injection through an interceptor.

- Tailwind CSS 4
  Used for rapid UI styling without creating a large custom CSS system.

 Backend

- Node.js + Express
  Chosen for a simple REST API structure and fast iteration.

- MongoDB + Mongoose
  Used because the data model is entity-heavy but still flexible, and Mongoose adds schema validation and indexing support.

- JWT authentication
  Used for stateless auth between frontend and backend.

- bcrypt
  Used for password hashing.

- express-validator
  Used to validate incoming request payloads at route level.

- Helmet, CORS, Morgan
  Used for basic API hardening, browser access control, and request logging.

Divergence from recommendations

- Authentication is implemented with custom JWT auth instead of Clerk or another managed auth provider. I chose this because it keeps the prototype self-contained and easier to run locally without third-party setup.

 6. Status: Fully Working, Partially Done, Skipped

 Fully working

- Multi-role signup and login
- Protected frontend routes by role
- Protected backend routes with role checks
- Institution listing for trainer signup
- Batch creation by trainer and institution
- Optional trainer assignment when an institution creates a batch
- Student email assignment to a batch
- Invite-link generation for batch joining
- Copy the invite token, log out, open the link in a new tab, and log in as a student. After login, the student is redirected to the dashboard where assigned sessions are visible.
- Student join-batch flow using invite token
- Session creation by trainer
- Session listing for trainer and student
- Attendance marking by student
- Session attendance view for trainer
- Institution summary reporting
- Programme-wide summary reporting for manager and monitoring officer

 Partially done

- Live deployment documentation is only partially discoverable from the repo
  The backend live URL is visible, but the frontend live URL is not present in repository config.

- Test account documentation is not production-ready
  The app supports creating all roles, but this repo does not include seeded fixed accounts for reviewers.

- Frontend environment handling
  The frontend API URL is hardcoded in code rather than using Vite environment variables.

 Skipped

- Automated tests
- Seed script for demo users and demo data
- Environment example files such as a committed env.example
- Export features such as CSV/Excel reporting

7. One Thing I Would Do Differently With More Time

I would move configuration and demo setup into a cleaner onboarding flow: use environment variables on the frontend, add a proper seed script for all five roles plus sample batches/sessions, and include fixed reviewer accounts so the project can be evaluated immediately without manual setup.

 API Overview

 Auth

- `GET /api/auth/institutions`
- `POST /api/auth/signup`
- `POST /api/auth/login`

 Batches

- `POST /api/batches`
- `GET /api/batches`
- `GET /api/batches/trainers`
- `GET /api/batches/institutions`
- `POST /api/batches/:batchId/invite`
- `POST /api/batches/:batchId/students`
- `GET /api/batches/:batchId/students`
- `POST /api/batches/:batchId/join`

Sessions

- `POST /api/sessions`
- `GET /api/sessions`

Attendance

- `POST /api/attendance/mark`

Reports

- `GET /api/sessions/:sessionId/attendance`
- `GET /api/batches/:batchId/summary`
- `GET /api/institutions/:institutionId/summary`
- `GET /api/programme/summary`

Health check

- `GET /health`

 Project Structure

Assignment/
|-- backend/
|   |-- app.js
|   |-- server.js
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   `-- utils/
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- utils/
|   `-- vite.config.js
------READMD.md
