# 🚀 FlagForge - The Ultimate CTF Platform

**Production-ready, beautiful, and secure Capture The Flag platform**

Built with Vue 3 • Tailwind CSS • Node.js • Express • Prisma • MySQL

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database](#-database)
- [Running the Project](#-running-the-project)
- [Security Features](#-security-features)
- [Default Credentials](#-default-credentials)
- [Project Structure](#-project-structure)

---

## 🎯 Overview

**FlagForge** is a modern, production-ready Capture The Flag (CTF) platform designed for cybersecurity competitions, training, and educational purposes. It combines cutting-edge web technologies with paranoid security practices to deliver a beautiful and secure experience.

### Why FlagForge?

- 🔒 **Security-first** - Constant-time flag comparison, scrypt hashing, rate limiting, CSRF protection
- 🎨 **Beautiful UI** - Cyberpunk/neon theme with glassmorphism and smooth animations
- ⚡ **Modern Stack** - Vue 3 Composition API, Tailwind CSS 3.4+, Vite, Prisma ORM
- 🚀 **Production-ready** - Docker support, comprehensive logging, error handling
- 📊 **Feature-rich** - Multiple flag types, dynamic scoring, hints, attachments, scoreboard

---

## ✨ Features

### Core Features

- ✅ **User Management** - Registration, login, JWT auth, role-based access control
- ✅ **Challenge System** - Multiple categories, difficulty levels, static/dynamic/regex flags
- ✅ **Security Features** - Scrypt hashing, constant-time comparison, rate limiting, CSRF protection
- ✅ **Scoring & Leaderboard** - Real-time scoreboard with first blood tracking
- ✅ **Admin Dashboard** - Full CRUD for CTFs, challenges, flags, users

### UI/UX Features

- 🎨 Cyberpunk/neon dark theme with glassmorphism
- 📱 Fully responsive (mobile-first design)
- ⚡ Smooth animations and transitions
- 🔔 Beautiful toast notifications
- 💻 Monospace flag input with neon glow

---

## 🛠️ Tech Stack

### Frontend
- **Vue 3** (^3.5.13) - Composition API + `<script setup>`
- **Vite** (^6.0.1) - Build tool
- **Vue Router** (^4.4.5) - Routing
- **Pinia** (^2.2.6) - State management
- **Tailwind CSS** (^3.4.15) - Styling
- **Axios** - HTTP client
- **vue-toastification** - Notifications
- **marked** - Markdown rendering
- **vee-validate + zod** - Form validation

### Backend
- **Node.js** (>=20) + **Express** (^4.21.1)
- **Prisma** (^5.22.0) - ORM
- **MySQL** 8.0 - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **scrypt** - Flag hashing
- **helmet, cors, csurf** - Security
- **winston + morgan** - Logging
- **express-rate-limit** - Rate limiting

---

## 🚀 Quick Start

### Using Docker (Recommended)

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd FlagPortal-Project

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
\`\`\`

---

## 📦 Installation

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- MySQL 8.0

### 1. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
\`\`\`

### 2. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install
\`\`\`

---

## ⚙️ Configuration

### Environment Variables

Create a \`.env\` file in the root directory (copy from \`.env.example\`):

#### Database

\`\`\`env
DATABASE_URL=mysql://flagforge_user:flagforge_password@localhost:3306/flagforge
MYSQL_DATABASE=flagforge
MYSQL_USER=flagforge_user
MYSQL_PASSWORD=flagforge_password
\`\`\`

#### Security (IMPORTANT: Change these in production!)

\`\`\`env
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
COOKIE_SECRET=your-super-secret-cookie-key-change-in-production
CSRF_SECRET=your-super-secret-csrf-key-change-in-production
\`\`\`

#### Admin Default Credentials

\`\`\`env
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_EMAIL=admin@flagforge.uz
DEFAULT_ADMIN_PASSWORD=AdminPass123!
\`\`\`

⚠️ **IMPORTANT**: Change the admin password on first login!

---

## 🗄️ Database

### Migrations

\`\`\`bash
# Create a new migration
cd backend
npm run prisma:migrate

# View database in Prisma Studio
npm run prisma:studio
\`\`\`

### Seed Data

The seed script creates:

- 1 Admin user (must change password on first login)
- 1 Active CTF competition
- 5 Sample challenges (Web, Pwn, Crypto, Reverse, Misc)
- Properly hashed flags using scrypt

\`\`\`bash
cd backend
npm run prisma:seed
\`\`\`

---

## 🏃 Running the Project

### Development Mode

#### Terminal 1 - Backend

\`\`\`bash
cd backend
npm run dev
\`\`\`

Backend runs on http://localhost:4000

#### Terminal 2 - Frontend

\`\`\`bash
cd frontend
npm run dev
\`\`\`

Frontend runs on http://localhost:5173

---

## 🔒 Security Features

### Flag Security

1. **Scrypt Hashing**
   - Memory-hard algorithm (resistant to GPU attacks)
   - Per-flag random salt (32 bytes)
   - High iteration count (N=16384)

2. **Constant-Time Comparison**
   - Uses \`timingSafeEqual\` to prevent timing attacks

3. **Flag Types**
   - **Static**: Same flag for all users (hashed)
   - **Dynamic**: Per-user flags with templates
   - **Regex**: Pattern matching for flexible flags

### Authentication Security

- JWT tokens in httpOnly cookies (not localStorage)
- bcrypt for password hashing (12 rounds)
- Password requirements enforced
- CSRF protection

### Rate Limiting

- Global API: 100 requests/minute
- Auth endpoints: 5 attempts/15 minutes
- Flag submission: 5 attempts/minute per user + IP

---

## 🔑 Default Credentials

After seeding the database:

**Admin Account:**
- Username: \`admin\`
- Email: \`admin@flagforge.uz\`
- Password: \`AdminPass123!\`

⚠️ **CRITICAL**: You MUST change this password on first login!

**Sample Challenge Flags:**
- Web: \`flag{sql_1nj3ct10n_1s_d4ng3r0us}\`
- Pwn: \`flag{buff3r_0v3rfl0w_m4st3r}\`
- Crypto: \`flag{c4es4r_c1ph3r_1s_w34k}\`
- Reverse: \`flag{r3v3rs3_3ng1n33r1ng_fun}\`
- Misc: \`flag{qr_c0d3s_4r3_fun}\`

---

## 📁 Project Structure

\`\`\`
FlagPortal-Project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.js                # Database seed script
│   ├── src/
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Auth, rate limit, validation
│   │   ├── routes/                # API routes
│   │   ├── utils/                 # Flag hashing, JWT, logger
│   │   └── server.js              # Main server file
│   ├── uploads/                   # Challenge attachments
│   ├── logs/                      # Application logs
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                   # API client
│   │   ├── assets/                # CSS, images
│   │   ├── components/            # Vue components
│   │   ├── router/                # Vue Router config
│   │   ├── stores/                # Pinia stores
│   │   ├── views/                 # Page components
│   │   ├── App.vue                # Root component
│   │   └── main.js                # Entry point
│   ├── public/
│   ├── index.html
│   ├── tailwind.config.js         # Tailwind configuration
│   ├── vite.config.js             # Vite configuration
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
\`\`\`

---

## 📚 API Documentation

### Authentication Endpoints

\`\`\`
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
\`\`\`

### Challenge Endpoints

\`\`\`
GET  /api/challenges
GET  /api/challenges/:id
GET  /api/challenges/:id/stats
\`\`\`

### Submission Endpoints

\`\`\`
POST /api/submissions/:challengeId
GET  /api/submissions
\`\`\`

### Scoreboard Endpoints

\`\`\`
GET  /api/scoreboard
GET  /api/scoreboard/user/:id
\`\`\`

### Admin Endpoints (Requires Admin Role)

\`\`\`
POST   /api/admin/ctf
PUT    /api/admin/ctf/:id
DELETE /api/admin/ctf/:id

POST   /api/admin/challenges
PUT    /api/admin/challenges/:id
DELETE /api/admin/challenges/:id

POST   /api/admin/flags
DELETE /api/admin/flags/:id

GET    /api/admin/users
PUT    /api/admin/users/:id
\`\`\`

---

## 🧪 Testing

### Backend Tests

\`\`\`bash
cd backend
npm test
\`\`\`

### Frontend Tests

\`\`\`bash
cd frontend
npm test
\`\`\`

---

## 🚢 Deployment

### Docker Production Deployment

\`\`\`bash
# Set production environment variables
cp .env.example .env
# Edit .env with production values

# Build and run
docker compose up -d --build

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Seed database
docker compose exec backend npm run prisma:seed
\`\`\`

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Security: Inspired by OWASP and CTFd best practices
- Design: Cyberpunk aesthetic inspired by modern gaming UIs

---

<div align="center">

Made with ❤️ by BytePhantom

**Happy Hacking! 🚀**

</div>