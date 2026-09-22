# DevConnect — Developer Social & Portfolio Platform

A social platform where developers create a profile, import their GitHub repositories, write posts, follow each other and comment. It is the classic full-stack CRUD application, but built at production quality: real authentication, image uploads, pagination, search and a deployed URL.

## Features

### ✅ Built so far
- **Authentication** — JWT-based signup/login, bcrypt password hashing, protected routes on both frontend and backend
- **Profiles** — public profile pages (`/profile/:username`), editable bio/avatar/GitHub username, avatar fallback (initial-letter) when no image is set
- **Posts** — create, read, update, delete, with server-side ownership checks (only the author can edit/delete their own post)
- **Feed** — paginated home feed, newest posts first, "Load more" pagination
- **Responsive layout** — Navbar (with mobile menu + search bar UI), Footer, dynamic breadcrumb trail derived from the current route

### 🚧 Planned
- Comments on posts
- Follow / unfollow system
- GitHub repo import (pull and display a user's repos via the GitHub API)
- Image uploads (avatar + post images — currently URL-only, no file storage yet)
- Real search (the navbar search bar is currently UI-only)
- Deployment (frontend + backend + database)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), Tailwind CSS, react-router-dom |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (`jsonwebtoken`), `bcrypt` for password hashing |
| HTTP client | axios |

Both frontend and backend are written in JavaScript (not TypeScript).

## Project Structure

```
DevConnect/
├── backend/
│   ├── config/
│   ├── controller/       # authController, userController, postController
│   ├── database/         # Mongoose connection
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # User, Post
│   ├── routes/           # authRoutes, userRoutes, postRoutes
│   ├── .env
│   └── app.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/    # Navbar, Footer, Breadcrumb
        │   ├── ProtectedRoute.jsx
        │   ├── GuestRoute.jsx
        │   ├── PostCard.jsx
        │   └── CreatePostForm.jsx
        ├── context/       # AuthContext
        ├── services/      # api.js, userService.js, postService.js
        ├── pages/         # Login, Signup, Home, Profile, EditProfile
        ├── App.jsx
        └── main.jsx
```

## Getting Started

### Prerequisites
- Node.js
- A running MongoDB instance (local or Atlas)

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/devconnect
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
PORT=5500
```

Run the server:

```bash
npm start
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend to be running at `http://localhost:5500`, configured in `src/services/api.js`.

## API Overview

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create an account |
| POST | `/api/auth/login` | No | Log in, receive a JWT |
| GET | `/api/auth/me` | Yes | Get the current logged-in user |
| GET | `/api/users/:username` | No | Get a public profile |
| PUT | `/api/users/me` | Yes | Update your own profile (bio, avatarUrl, githubUsername) |
| GET | `/api/posts` | No | Paginated feed of all posts |
| GET | `/api/posts/user/:username` | No | Paginated posts by a specific user |
| POST | `/api/posts` | Yes | Create a post |
| PUT | `/api/posts/:id` | Yes (author only) | Update a post |
| DELETE | `/api/posts/:id` | Yes (author only) | Delete a post |
