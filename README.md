# Study UAE - Full-Stack Admissions & Student Information Platform

A production-grade, full-stack EdTech and admissions platform built to manage higher education applications, university onboarding, lead intake, real-time counselor-student live chat, and institutional operations across the UAE.

---

## 🌟 Architecture Overview

The repository is structured as a modular full-stack platform containing three core services:

```
Study-UAE/
├── suae-frontend/     # Student & Institution Administration Portal (React + AntD + Recharts)
├── suae-node/         # Core REST API & Real-Time Socket Service (Node.js + Express + Knex + MySQL)
├── suae-website/      # Public Landing & Discovery Website (Vite + React + Tailwind CSS)
└── sample_data/       # Demo & sample datasets for batch course and student imports
```

| Service | Technology Stack | Key Responsibilities | Deployment Target |
| :--- | :--- | :--- | :--- |
| **`suae-website`** | React 18, Vite, Tailwind CSS, Lucide | High-conversion admissions landing page, university exploration, interactive consultation forms, and student reviews. | **Vercel** |
| **`suae-frontend`** | React 18, Ant Design, Tailwind CSS, Recharts | Comprehensive portal for students and administrators: application tracking, document uploads, live support desk, analytics, and letter generation. | **Vercel** |
| **`suae-node`** | Node.js, Express, Socket.io, Knex.js, MySQL | High-throughput REST API, Socket.io real-time chat & audio calling, dynamic form rendering engine, OTP verification, and JWT authentication. | **Render** |

---

## 🚀 Key Features

1. **Dynamic Form & Intake Engine**:
   - Customizable multi-step forms with dynamic field schemas and conditional logic.
   - Built-in CAPTCHA verification and mobile OTP validation.
   - Embeddable widget support for third-party landing pages.

2. **Real-time Live Chat & Audio Calling**:
   - WebSocket-powered chat between admissions counselors and prospective students via Socket.io.
   - Audio call signalling with file and media attachments support.

3. **Institutional SIS & Admin Dashboard**:
   - Program, fee package, and course catalog management with CSV batch import.
   - Student application lifecycle tracking from inquiry to admission.
   - Custom admission letter and scholarship certificate generation.

4. **Public Discovery Portal**:
   - SEO-optimized modern landing page with mobile responsiveness.
   - University listings across Emirates (Dubai, Abu Dhabi, Sharjah, Ajman, RAK, etc.).

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **MySQL** (v8+ or MariaDB)

---

### 1. Backend API (`suae-node`)

```bash
cd suae-node
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MySQL credentials (DB_HOST, DB_USER, DB_PASS, DB_NAME)

# Start development server
npm run dev
# The API will be available at http://localhost:5000
# Health check: http://localhost:5000/health
```

---

### 2. Admin & Student Portal (`suae-frontend`)

```bash
cd suae-frontend
npm install

# Setup environment variables
cp .env.example .env
# Point REACT_APP_API_URL_NODE to http://localhost:5000/

# Start development server
npm start
# The Portal will run at http://localhost:3000
```

---

### 3. Public Website (`suae-website`)

```bash
cd suae-website
npm install

# Setup environment variables
cp .env.example .env
# Point VITE_NODE_API_URL to http://localhost:5000

# Start development server
npm run dev
# The Website will run at http://localhost:5173
```

---

## ☁️ Deployment Guide

### Deploying `suae-node` on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/adityapandey9977-code/Study-UAE`.
4. Configure the service settings:
   - **Name**: `study-uae-api`
   - **Root Directory**: `suae-node`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, configure:
   - `NODE_ENV`: `production`
   - `APP_PORT`: `5000`
   - `DB_HOST`: `your_cloud_mysql_host`
   - `DB_PORT`: `3306`
   - `DB_USER`: `your_cloud_mysql_user`
   - `DB_PASS`: `your_cloud_mysql_password`
   - `DB_NAME`: `your_cloud_mysql_database`
   - `DB_SSL`: `false` (or `true` if your provider requires SSL)
   - `GLOBAL_PASS`: `your_secure_password_hash`
6. Click **Deploy Web Service**. Render will provision your API with HTTPS automatically.

---

### Deploying `suae-frontend` on Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New...** → **Project**.
2. Select the `Study-UAE` repository.
3. Configure project settings:
   - **Project Name**: `study-uae-portal`
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click *Edit* and select `suae-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. In **Environment Variables**, add:
   - `REACT_APP_API_URL_NODE`: `https://study-uae-api.onrender.com/` *(your Render API URL)*
   - `REACT_APP_API_URL`: `https://study-uae-api.onrender.com/`
   - `REACT_APP_WEBSITE_URL`: `https://study-uae.vercel.app` *(your deployed website URL)*
   - `REACT_APP_UPLOADS_URL`: `https://study-uae-api.onrender.com/uploads/`
5. Click **Deploy**. The `vercel.json` ensures all sub-routes handle SPA routing cleanly.

---

### Deploying `suae-website` on Vercel

1. In Vercel, click **Add New...** → **Project**.
2. Select the `Study-UAE` repository again.
3. Configure project settings:
   - **Project Name**: `study-uae-website`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `suae-website`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_NODE_API_URL`: `https://study-uae-api.onrender.com`
   - `VITE_STUDENT_LOGIN_URL`: `https://study-uae-portal.vercel.app/student-login`
5. Click **Deploy**.

---

## 🎯 Interview Highlights & Technical Discussion Points

- **Legacy-to-Modern Backend Consolidation (Strangler Fig Pattern)**:
  - Systematically phased out legacy monolith endpoints and consolidated 100% of services into an asynchronous, non-blocking Node.js/Express service.
  - Implemented unified JWT authentication, eliminating dual-token state across legacy and modern services.
  - Engineered backward-compatible shims for multipart form-data, automated schema introspection, and dynamic query generation with Knex.js.
- **Monorepo Separation of Concerns**: Clear demarcation between customer-facing acquisition (Vite SPA website), enterprise application portal (React + Ant Design), and resilient real-time microservice backend (Node + Express + Socket.io).
- **High-Concurrency Real-Time Socket Architecture**: Centralized connection management with room multiplexing and heartbeat ping-pong for instant counselor-student chat and audio calling.
- **Dynamic Schema-Driven Form & Lead Engine**: Schema-driven form rendering that persists dynamic metadata into MySQL JSON columns, complete with self-hosted SVG CAPTCHA verification and mobile OTP validation.
- **Cloud-Native 12-Factor Deployment**: Decoupled environment configuration for zero-friction containerized deployment on Render and edge deployment on Vercel with automated SSL and SPA routing.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
