# 🚀 HireFlow

### Candidate Application & Recruitment Management System

**HireFlow** is a lightweight, full-stack recruitment management platform that streamlines the hiring workflow from **candidate application to final decision**.

It provides two focused experiences:

* 👤 **Candidate Portal** — candidates can browse available positions and submit applications with resumes.
* 🧑‍💼 **Recruiter Dashboard** — recruiters can manage jobs, review candidates, filter applications, access resumes, and move candidates through the hiring pipeline.

Built with a focus on **clean architecture, usability, security, and real-world functionality** rather than unnecessary complexity.

---

## 🌐 Live Demo

### Candidate Application

👉 https://hireflow-npo04k7ns-dinakar-sasanks-projects.vercel.app/apply

### Recruiter / Admin Dashboard

👉 https://hireflow-npo04k7ns-dinakar-sasanks-projects.vercel.app/admin/login

### Source Code

👉 https://github.com/devarasasank31/hireflow

---

## ✨ Features

### 👤 Candidate Portal

Candidates can:

* View available job opportunities
* Select a position from the job dropdown
* Submit their personal information
* Upload a resume
* Add a brief application note
* Receive immediate submission feedback
* Apply without creating an account

### 🧑‍💼 Recruiter Dashboard

Recruiters can:

* Securely sign in
* View all candidate applications
* Search candidates
* Filter candidates by job
* Filter candidates by hiring stage
* View candidate details
* Open/download resumes
* Update candidate stages
* Manage job openings
* Create new jobs
* Edit existing jobs
* Activate/deactivate job postings
* View application counts

---

## 🔄 Hiring Pipeline

Every new application starts at:

```text
Applied
   │
   ├── Reject
   │
   └── R1
        │
        ├── R1 Reject
        │
        └── R2
             │
             ├── R2 Reject
             │
             └── R3
                  │
                  ├── R3 Reject
                  │
                  └── Approved
```

Supported application stages:

```text
Applied
Reject
R1
R1 Reject
R2
R2 Reject
R3
R3 Reject
Approved
```

Stage changes are persisted directly to the database.

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      Candidate      │
                         │       Browser       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     React + Vite    │
                         │    Candidate UI     │
                         └──────────┬──────────┘
                                    │
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────┐
│                         Supabase                          │
│                                                           │
│   ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│   │ PostgreSQL   │    │     Auth     │   │  Storage   │ │
│   │              │    │              │   │            │ │
│   │ Jobs         │    │ Admin Login  │   │ Resumes    │ │
│   │ Applications │    │              │   │            │ │
│   └──────────────┘    └──────────────┘   └────────────┘ │
│                                                           │
└────────────────────────────┬──────────────────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Recruiter Dashboard │
                  │                     │
                  │ Jobs                │
                  │ Applications        │
                  │ Filters             │
                  │ Hiring Pipeline     │
                  └─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* React Hook Form
* Zod
* Lucide React

### Backend / Platform

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Row Level Security (RLS)

### Deployment

* Vercel
* GitHub

---

## 🗄️ Database Design

### `jobs`

| Field             | Type        | Description                                   |
| ----------------- | ----------- | --------------------------------------------- |
| `id`              | UUID        | Unique job identifier                         |
| `title`           | TEXT        | Job title                                     |
| `location`        | TEXT        | Job location                                  |
| `employment_type` | TEXT        | Full-time / Part-time / Internship / Contract |
| `description`     | TEXT        | Job description                               |
| `is_active`       | BOOLEAN     | Controls public visibility                    |
| `created_at`      | TIMESTAMPTZ | Creation timestamp                            |
| `updated_at`      | TIMESTAMPTZ | Last update timestamp                         |

### `applications`

| Field                  | Type        | Description                   |
| ---------------------- | ----------- | ----------------------------- |
| `id`                   | UUID        | Unique application identifier |
| `name`                 | TEXT        | Candidate name                |
| `phone`                | TEXT        | Candidate phone               |
| `email`                | TEXT        | Candidate email               |
| `resume_path`          | TEXT        | Secure storage path           |
| `resume_original_name` | TEXT        | Original resume filename      |
| `job_id`               | UUID        | Related job                   |
| `note`                 | TEXT        | Candidate note                |
| `stage`                | TEXT        | Current hiring stage          |
| `created_at`           | TIMESTAMPTZ | Application timestamp         |
| `updated_at`           | TIMESTAMPTZ | Last update timestamp         |

---

## 🔐 Security

HireFlow uses Supabase Row Level Security to separate candidate and recruiter access.

### Public candidates

Candidates can:

* Read active jobs
* Submit applications
* Upload resumes

Candidates **cannot**:

* Read other applications
* Modify applications
* Delete applications
* Access the admin dashboard

### Authenticated recruiters

Recruiters can:

* View applications
* Update application stages
* Manage jobs
* Access candidate resumes

### Resume security

Resumes are stored in a **private Supabase Storage bucket** rather than being exposed publicly.

Admin access is authenticated.

### Environment security

Sensitive credentials are never committed to Git.

Frontend environment variables use only the public Supabase client credentials.

The Supabase service-role/secret key is **never exposed to the browser**.

---

## 📋 Validation

Candidate applications validate:

* Required name
* Email format
* Phone number
* Job selection
* Resume type
* Resume size
* Note length

Supported resume formats:

```text
PDF
DOC
DOCX
```

Maximum resume size:

```text
5 MB
```

---

## 💼 Job Management

Recruiters can manage the complete job lifecycle.

```text
Create
  ↓
Active
  ↓
Edit
  ↓
Deactivate
  ↓
Archived / Inactive
```

Deactivated jobs:

* Remain in the database
* Preserve existing applications
* Are removed from the public candidate dropdown

This avoids accidentally breaking historical application records.

---

## 🔎 Candidate Search & Filtering

Recruiters can combine:

### Search

Search by:

* Name
* Email
* Phone

### Job

Filter by:

* Any job
* Specific job

### Stage

Filter by:

* Applied
* R1
* R1 Reject
* R2
* R2 Reject
* R3
* R3 Reject
* Reject
* Approved

Filters can be combined for more precise candidate discovery.

---

## 📱 Responsive Design

HireFlow is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

The interface intentionally prioritizes:

* Clear navigation
* Readable tables
* Simple forms
* Responsive layouts
* Accessible controls
* Fast interactions

---

## 🚀 Getting Started

### Prerequisites

Install:

* Node.js 18+
* npm
* Git
* A free Supabase account

---

### 1. Clone the repository

```bash
git clone https://github.com/devarasasank31/hireflow.git

cd hireflow
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Create a Supabase project

Create a free project at:

https://supabase.com/

---

### 4. Run the database migration

Open:

```text
supabase/migrations/001_initial.sql
```

Copy the SQL into:

**Supabase → SQL Editor**

Run the migration.

This creates:

* `jobs`
* `applications`
* indexes
* constraints
* triggers
* Row Level Security policies

---

### 5. Seed the initial jobs

Open:

```text
supabase/seed.sql
```

Run it once in the Supabase SQL Editor.

This creates 10 initial job openings.

---

### 6. Create the admin account

In:

**Supabase → Authentication → Users**

Create:

```text
Email: admin@enter.in
Password: Admin@12345!
```

There is intentionally no public signup functionality.

---

### 7. Create resume storage

In:

**Supabase → Storage**

Create a private bucket:

```text
resumes
```

Configure the required Storage policies from the project setup instructions.

---

### 8. Configure environment variables

Create:

```text
.env.local
```

Add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_public_key
```

Never commit `.env.local`.

---

### 9. Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:5173/apply
```

Admin:

```text
http://localhost:5173/admin/login
```

---

## 🧪 Production Build

Verify the production build locally:

```bash
npm run build
```

The project should compile successfully before deployment.

---

## ☁️ Deployment

HireFlow is deployed using:

```text
GitHub
   ↓
Vercel
   ↓
Production
```

Supabase provides:

```text
Database
Authentication
Storage
```

Vercel provides the frontend hosting.

### Vercel Environment Variables

Add:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Then deploy:

```bash
git push origin main
```

Vercel automatically builds and deploys the latest commit.

---

## 🔑 Demo Credentials

### Admin

```text
Email:
admin@enter.in

Password:
Admin@12345!
```

> These credentials are intended only for the temporary assignment/demo environment.

---

## 📊 Application Flow

```text
Candidate
   │
   ▼
Browse Jobs
   │
   ▼
Select Position
   │
   ▼
Fill Application
   │
   ▼
Upload Resume
   │
   ▼
Submit
   │
   ▼
Application Created
   │
   ▼
Applied
   │
   ▼
Recruiter Review
   │
   ├──── Reject
   │
   └──── R1
          │
          ├──── R1 Reject
          │
          └──── R2
                 │
                 ├──── R2 Reject
                 │
                 └──── R3
                        │
                        ├──── R3 Reject
                        │
                        └──── Approved
```

---

## 🎯 Design Principles

HireFlow was built around a few principles:

### 1. Simple over complex

The system focuses on the actual recruitment workflow rather than unnecessary features.

### 2. Functional over flashy

Every major UI element maps to a real operation.

### 3. Secure by default

Candidate data and resumes are protected through authentication, authorization, and RLS.

### 4. Fast development

The architecture uses managed infrastructure to reduce unnecessary backend complexity.

### 5. Production-minded

The application includes:

* Validation
* Error handling
* Loading states
* Protected routes
* Database constraints
* Storage security
* Responsive UI
* Production deployment

---

## 📁 Project Structure

```text
hireflow/
│
├── public/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql
│   └── seed.sql
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── vite.config.ts
└── ...
```

---

## 🔗 Links

**Live Candidate Portal**
https://hireflow-npo04k7ns-dinakar-sasanks-projects.vercel.app/apply

**Live Admin Portal**
https://hireflow-npo04k7ns-dinakar-sasanks-projects.vercel.app/admin/login

**GitHub Repository**
https://github.com/devarasasank31/hireflow

---

## 📝 Assignment Context

HireFlow was developed as a full-stack recruitment management solution for an AI Fullstack Intern technical assignment.

The implementation focuses on the requested requirements:

* Public job application
* Resume upload
* Admin authentication
* Job management
* Candidate management
* Job filtering
* Stage filtering
* Hiring pipeline
* Online deployment

The solution intentionally keeps the architecture lightweight while maintaining a production-oriented approach to data access and security.

---

## 👨‍💻 Author

**Shashank Devarasetty**

Full-Stack Developer | Java | Spring Boot | React | Node.js | AI Applications

---

## ⭐ If you found this project interesting

Feel free to explore the codebase, try the live application, or connect with me on GitHub.
