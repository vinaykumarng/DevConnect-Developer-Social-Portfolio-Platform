# DevConnect — Developer Social & Portfolio Platform

A social platform where developers create a profile, import their GitHub repositories, write posts, follow each other and comment. It is the classic full-stack CRUD application, but built at production quality: real authentication, image uploads, pagination, search and a deployed URL.

> **Project status:** the database is being migrated from MongoDB to PostgreSQL (with Prisma), and sign-in is moving to Google login plus a verified GitHub connection. This work lives on a separate branch. `main` holds the complete, working MongoDB version. On the migration branch, authentication, profiles and the seed script already run on Postgres, while posts, comments and follows are still being ported.

## Features

### Built (complete on `main`)
- **Authentication** — JWT-based login, bcrypt password hashing, protected routes on both frontend and backend
- **Profiles** — public profile pages (`/profile/:username`), editable bio, avatar and GitHub username, with an initial-letter avatar fallback
- **Image uploads** — avatar and post images via Multer and Cloudinary (type and 5 MB size limits, nothing written to local disk)
- **Posts** — create, read, delete, with server-side ownership checks (only the author can change their own post)
- **Feed** — paginated home feed, newest first, "Load more"
- **Comments** — add and delete comments (author-only delete), loaded lazily per post
- **Follow system** — follow and unfollow, follower and following counts, self-follow blocked
- **GitHub repo import** — shows a user's public, non-forked repositories (name, stars, language, forks) on their profile
- **Responsive layout** — Navbar with mobile menu, Footer, dynamic breadcrumb trail
- **Seed script** — synthetic users, posts, comments and follows for local development

### In progress
- **PostgreSQL migration** (Prisma 6): schema, Docker-based local database and the auth, profile and seed code are done; posts, comments and follows are next
- **Google sign-in** — new users choose a username and can optionally set a password; existing users sign in directly
- **Connect GitHub** — GitHub OAuth so the GitHub username on a profile is verified, not just typed in

### Planned
- Real search (the navbar search bar is currently UI only)
- Following-only feed filter
- Remote managed Postgres and deployment

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), Tailwind CSS, react-router-dom, axios |
| Backend | Node.js, Express (ESM) |
| Database | PostgreSQL + Prisma 6 (MongoDB + Mongoose still used by the unported parts) |
| Local database | PostgreSQL 16 in Docker |
| Auth | JWT (`jsonwebtoken`), `bcrypt`; Google OAuth planned |
| Images | Multer + Cloudinary |

Both frontend and backend are written in JavaScript (not TypeScript).

## Project Structure

```
DevConnect/
├── docker-compose.yml        # local PostgreSQL
├── backend/
│   ├── config/               # Cloudinary config
│   ├── controller/           # auth, user, post, comment, follow, github
│   ├── database/             # prisma.js (shared client), db.js (legacy Mongo)
│   ├── middleware/           # protect, optionalAuth, upload (multer)
│   ├── models/               # legacy Mongoose models, removed once ported
│   ├── prisma/               # schema.prisma + migrations
│   ├── routes/
│   ├── scripts/              # seed.js, dbcheck.js
│   ├── utils/                # uploadToCloudinary.js
│   └── app.js
│
└── frontend/
    └── src/
        ├── components/       # layout/, PostCard, CreatePostForm, CommentSection, FollowButton, RepoCard, route guards
        ├── context/          # AuthContext
        ├── services/         # api and per-feature service modules
        ├── pages/            # Login, Home, Profile, EditProfile
        ├── App.jsx
        └── main.jsx
```

## Getting Started

### Prerequisites
- Node.js
- Docker Desktop (for the local PostgreSQL database)
- A free [Cloudinary](https://cloudinary.com) account (for image uploads)
- A running MongoDB instance, only while posts, comments and follows are still being ported

### 1. Start the database

From the repo root:

```bash
docker compose up -d
```

If port 5432 is already used by a Postgres installed on your machine, change the left side of the port mapping in `docker-compose.yml` to `5433` and use `5433` in `DATABASE_URL` below. The credentials in the compose file are for local development only.

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://devconnect:devconnect_local@localhost:5432/devconnect
MONGO_URI=mongodb://localhost:27017/devconnect   # temporary, until the port is finished
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
PORT=5500

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: raises the GitHub API rate limit from 60 to 5000 requests/hour
GITHUB_TOKEN=
```

Create the tables, optionally load sample data, and start the server:

```bash
npx prisma migrate dev
node scripts/seed.js      # optional: 8 users with posts, comments and follows
npm start
```

Seeded accounts all use the password `password123` (for example `ada@example.com`). The seed script wipes existing data, so never run it against a database you care about.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:5500`, configured in `src/services/api.js`.

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Log in with email and password, receive a JWT |
| GET | `/api/auth/me` | Yes | Current logged-in user |
| GET | `/api/users/:username` | No | Public profile |
| PUT | `/api/users/me` | Yes | Update bio and GitHub username |
| POST | `/api/users/me/avatar` | Yes | Upload an avatar (multipart, field `avatar`) |
| GET | `/api/posts` | No | Paginated feed |
| GET | `/api/posts/user/:username` | No | Paginated posts by one user |
| POST | `/api/posts` | Yes | Create a post (multipart: `content`, optional `image`) |
| PUT | `/api/posts/:id` | Author only | Update a post |
| DELETE | `/api/posts/:id` | Author only | Delete a post |
| GET | `/api/comments/post/:postId` | No | Paginated comments on a post |
| POST | `/api/comments/post/:postId` | Yes | Add a comment |
| DELETE | `/api/comments/:id` | Author only | Delete a comment |
| GET | `/api/follows/:username/status` | Optional | Counts, and whether the current user follows them |
| GET | `/api/follows/:username/followers` | No | A user's followers |
| GET | `/api/follows/:username/following` | No | Users a user follows |
| POST | `/api/follows/:username/follow` | Yes | Follow a user |
| DELETE | `/api/follows/:username/follow` | Yes | Unfollow a user |
| GET | `/api/github/:githubUsername/repos` | No | Public, non-forked repos sorted by stars |

Email/password signup was removed on the migration branch. New accounts will be created through Google sign-in. Until then, use the seed script for test accounts. The posts, comments and follows endpoints are still being ported to PostgreSQL on that branch.

## Database

PostgreSQL, managed with Prisma migrations (`backend/prisma`). Tables: `users`, `oauth_accounts` (one row per linked provider), `posts`, `comments` and `follows`. Ids are UUIDs, foreign keys cascade on delete, and a database CHECK constraint prevents users from following themselves.

## License

Not yet decided.