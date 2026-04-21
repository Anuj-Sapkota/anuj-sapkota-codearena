# CodeArena

CodeArena is a web-based competitive programming and learning platform designed to help users improve their coding skills through problem solving, challenges, and structured learning resources.

The system provides features such as user registration, login, problem submission with real-time code execution, challenge participation, course management, leaderboards, and a creator studio for publishing learning content.

---

## Project Objective

The main objective of this project is to develop a full-stack platform that enables users to practice programming problems, compete in challenges, track their progress through gamification, and access curated learning resources — all through a simple and efficient interface.

---

## Features

The system provides the following features:

- User registration and OAuth login (Google, GitHub)
- User login and JWT-based authentication
- Dashboard for users with XP, level, and streak tracking
- Problem solving with real-time code execution via Judge0
- Challenge participation with bonus XP rewards
- Search functionality across problems, courses, and challenges
- Creator studio for publishing video, PDF, and article resources
- Admin panel for user, problem, and content moderation
- Notification system for badges, level-ups, and achievements
- Leaderboard and gamification (XP, levels, badges, streaks)
- Secure logout system

---

## Technologies Used

### Frontend

- React 19 (Next.js 16)
- TypeScript
- Tailwind CSS
- Redux Toolkit + Redux Persist
- TanStack React Query
- Monaco Editor (code editor)

### Backend

- Node.js with Express 5
- TypeScript
- Passport.js (Google & GitHub OAuth)
- JWT (access + refresh token strategy)
- Nodemailer (email)
- Cloudinary (media uploads)
- Judge0 API (code execution)

### Database

- PostgreSQL
- Prisma ORM

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon

---

## System Requirements

### Hardware

- Computer or smartphone
- Internet connection

### Software

- Web browser such as Google Chrome or Firefox
- Node.js v18 or higher
- PostgreSQL database
- Docker Desktop with WSL2 backend (required for Judge0 code execution)
- WSL2 enabled on Windows (see Judge0 setup section for cgroup configuration)

---

## Installation and Setup

Steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/Anuj-Sapkota/anuj-sapkota-codearena.git
```

### 2. Go to the project folder

```bash
cd anuj-sapkota-codearena
```

### 3. Set up environment variables

Copy the example env files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Install dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 5. Set up Judge0 (Code Execution Engine)

> ⚠️ **Windows Users — Read this before proceeding.**
>
> Judge0 uses Linux kernel features (cgroups + isolate sandbox) that require **WSL2** with cgroup v1 support enabled. This is a one-time system setup. Without it, the Judge0 workers will start but code submissions will silently fail or hang.

#### 5a. Enable WSL2 with cgroup v1 (Windows only)

**Step 1 — Install WSL2** (skip if already installed):

Open PowerShell as Administrator and run:

```powershell
wsl --install
```

Restart your machine when prompted.

**Step 2 — Enable cgroup v1 for WSL2:**

Create or edit the file `C:\Users\<YourUsername>\.wslconfig` and add the following:

```ini
[wsl2]
kernelCommandLine=cgroup_no_v1=net
```

> This tells WSL2 to keep cgroup v1 enabled for everything except networking, which is what Judge0's isolate sandbox requires.

**Step 3 — Restart WSL:**

```powershell
wsl --shutdown
```

Then reopen Docker Desktop and wait for it to reconnect to WSL2.

**Step 4 — Verify Docker is using WSL2:**

In Docker Desktop → Settings → General, confirm "Use the WSL 2 based engine" is checked.

---

#### 5b. Start Judge0

Once WSL2 is configured, run the following from the project root:

```bash
cd judge0-v1.13.1
cp judge0.conf.example judge0.conf
docker compose up -d
```

Wait about 15–20 seconds for all services (server, workers, Redis, PostgreSQL) to initialize.

Verify Judge0 is running by visiting: `http://localhost:2358/system_info`

You should see a JSON response with system details. If you see it, Judge0 is ready.

> **Note:** The `JUDGE0_URL=http://localhost:2358` value in `backend/.env` is already configured to point to this local instance.

### 6. Set up the database

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 8. Run the application

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

---

## Live Project

Live URL of the deployed system:

```
https://codearena-frontend-ivory.vercel.app/
```

---

## Project Structure

```
codearena/
│
├── frontend/               # Next.js frontend application
│   ├── app/                # App router pages
│   ├── components/         # Reusable UI components
│   ├── lib/                # Store, services, utilities
│   └── public/             # Static assets
│
├── backend/                # Express backend API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/         # API route definitions
│   │   └── utils/          # Helpers and utilities
│   └── prisma/             # Database schema and migrations
│
├── judge0-v1.13.1/         # Judge0 code execution engine (Docker)
│   ├── docker-compose.yml  # Docker services config
│   └── judge0.conf.example # Judge0 configuration template
│
└── README.md
```

---

## Screenshots


- Login page
![alt text](image.png)
- User dashboard
![alt text](image-1.png)
- Problem solving workspace
![alt text](image-2.png)
- Creator studio

- Admin panel
- Leaderboard

---

## Troubleshooting Judge0

### Submissions hang or return no output

This is almost always the cgroup issue. The workers start but isolate can't sandbox the code.

**Fix:** Make sure `C:\Users\<YourUsername>\.wslconfig` contains exactly:

```ini
[wsl2]
kernelCommandLine=cgroup_no_v1=net
```

Then run:

```powershell
wsl --shutdown
```

Restart Docker Desktop and try `docker compose up -d` again inside `judge0-v1.13.1/`.

---

### `http://localhost:2358/system_info` returns nothing or connection refused

The server container hasn't started yet or crashed.

Check container status:

```bash
cd judge0-v1.13.1
docker compose ps
```

Check server logs:

```bash
docker compose logs server
```

If you see errors about cgroups or isolate, the `.wslconfig` fix above applies.

If the containers show as `Restarting`, give it 30 seconds — Judge0 retries on startup.

---

### Docker says "WSL2 backend not running" or similar

1. Open Docker Desktop → Settings → General
2. Make sure **"Use the WSL 2 based engine"** is checked
3. Apply and restart Docker Desktop

---

### `.wslconfig` changes don't seem to take effect

The file must be saved at exactly `C:\Users\<YourUsername>\.wslconfig` (not inside any subfolder). After editing it, you must run `wsl --shutdown` from PowerShell — simply restarting Docker is not enough.

---

### Workers container exits immediately

Open the workers logs:

```bash
docker compose logs workers
```

If you see `cgroup: No such file or directory` or `isolate: system error`, this confirms the cgroup v1 issue. Apply the `.wslconfig` fix and restart WSL.

---

### Everything looks fine but code execution still fails in the app

1. Visit `http://localhost:2358/system_info` — if this returns JSON, Judge0 is running
2. Check that `backend/.env` has `JUDGE0_URL=http://localhost:2358`
3. Restart the backend server after any `.env` changes

---

## Future Improvements

Possible improvements for the system:

- Mobile application version
- Real-time multiplayer coding battles
- Improved user interface and accessibility
- AI-powered code hints and explanations
- More advanced analytics for creators
- Additional security features (2FA)
- Discussion forums per problem

---

## Authors

Student Name : Anuj Sapkota

Program / Department: Bsc (Hons) Computing

University / College Name : London Met University / Itahari International COllege

---

## License

This project is created for educational purposes as part of a Final Year Project.