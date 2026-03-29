# Hostel Hub

Hostel Hub is a full-stack hostel management platform for students and hostel managers.

- Frontend: React + Vite
- Backend: Hono (Node.js)
- Database: SQLite (better-sqlite3)
- Auth: JWT-based login and protected routes

## Features

### Authentication and Access Control

- Register and login flows
- Role-based users: `manager` and `student` (plus seeded `admin` role)
- JWT-protected API routes (`/hostels`, `/bookings`, `/viewings`)
- Frontend session persistence with auto logout when token expires

### Manager Capabilities

- Create hostels
- View hostels they manage
- Review viewing requests
- Review booking requests
- Assign units to students
- Approve student checkout (moves active booking to history)

### Student Capabilities

- Browse all hostels
- Request viewings
- Request consideration/booking
- View own bookings and viewings
- Give notice before moving out
- View booking history

## Tech Stack

- React 19
- React Router
- Axios
- Vite
- Hono
- better-sqlite3
- jsonwebtoken
- bcryptjs
- pnpm

## Project Structure

```text
hostel_hub/
  server/
    index.js         # Hono server entry
    db.js            # SQLite schema + seed
    auth.js          # Register/login routes
    hostels.js       # Hostel routes
    bookings.js      # Booking routes
    viewings.js      # Viewing routes
  src/
    context/
      AuthContext.jsx
    hooks/
      useDashboardData.js
    pages/
      Login.jsx
      Register.jsx
      Dashboard.jsx
    components/
      ManagerView.jsx
      StudentView.jsx
      ProtectedRoute.jsx
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
JWT_SECRET=your_super_secret_key
```

If `JWT_SECRET` is not set, the app falls back to a default secret.

### 3. Run frontend + backend together

```bash
pnpm run start
```

This runs:

- Vite frontend: `http://localhost:5173`
- Hono backend: `http://localhost:5000`

### 4. Run services separately (optional)

```bash
pnpm run dev
pnpm run server
```

## Available Scripts

- `pnpm run dev` - Start frontend (Vite)
- `pnpm run server` - Start backend with watch mode
- `pnpm run start` - Start frontend and backend concurrently
- `pnpm run build` - Production frontend build
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

## API Overview

Base URL: `http://localhost:5000`

### Auth

- `POST /auth/register` - Register user
- `POST /auth/login` - Login user and receive JWT

### Hostels (JWT required)

- `GET /hostels` - Manager hostels
- `POST /hostels` - Create hostel (manager)
- `GET /hostels/all` - List all hostels (student browse)

### Bookings (JWT required)

- `GET /bookings/manager` - Manager booking requests
- `GET /bookings/student` - Student bookings
- `GET /bookings/student/history` - Student booking history
- `POST /bookings` - Student request consideration
- `PATCH /bookings/:id/assign` - Manager assigns a unit
- `PATCH /bookings/:id/notice` - Student gives leave notice
- `PATCH /bookings/:id/leave` - Manager approves checkout

### Viewings (JWT required)

- `POST /viewings` - Student requests viewing
- `GET /viewings/manager` - Manager viewings
- `GET /viewings/student` - Student viewings
- `PATCH /viewings/:id/status` - Manager sets status (`approved` or `completed`)

## Business Rules

- Students must complete a viewing (or have prior history in that hostel) before requesting consideration.
- Students cannot hold multiple active assignments without giving notice.
- Viewing and booking duplicate active requests are prevented.
- Checkout archives the booking in `booking_history`.

## Database Notes

- SQLite database file is stored at `server/hostel.db`.
- Tables are auto-created on server start.
- Roles are seeded automatically: `admin`, `manager`, `student`.

## Health Check

- `GET /health` returns API status.

## License

No license file is currently defined.
