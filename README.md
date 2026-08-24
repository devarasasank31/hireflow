# Enter Recruitment Application

A complete candidate application and hiring management system built with React, TypeScript, Tailwind CSS, and Supabase.

## Overview

This application consists of two parts:

1. **Public Candidate Application Page** - Where anyone can apply for open positions
2. **Admin Hiring Management Dashboard** - Where administrators manage the recruitment pipeline

## Features

### Candidate Application
- Browse and apply for open positions
- Upload resume (PDF, DOC, DOCX - max 5MB)
- Form validation for all fields
- Success confirmation after submission

### Admin Dashboard
- Secure email/password authentication
- View all candidate applications
- Search by name, email, or phone
- Filter by job and application stage
- Move candidates through hiring pipeline (Applied > R1 > R2 > R3 > Approved/Reject)
- View and download candidate resumes
- Create, edit, and deactivate job postings
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Notifications**: Sonner

## Architecture

```
src/
  components/
    layout/
      AdminLayout.tsx      - Admin navigation shell
  pages/
    ApplyPage.tsx          - Public candidate application
    AdminLoginPage.tsx     - Admin authentication
    DashboardPage.tsx      - Admin metrics overview
    ApplicationsPage.tsx   - Candidate management
    JobsPage.tsx           - Job CRUD management
    NotFoundPage.tsx       - 404 page
  hooks/
    useAuth.ts             - Authentication state management
  lib/
    supabase.ts            - Supabase client configuration
    constants.ts           - Application constants
  services/
    jobs.ts                - Job database operations
    applications.ts        - Application database operations
    storage.ts             - File upload/validation
  types/
    index.ts               - TypeScript type definitions
  utils/
    format.ts              - Date, file size, stage formatting
```

## Database Schema

### jobs table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Job title |
| location | TEXT | Job location |
| employment_type | TEXT | Full-time/Part-time/Internship/Contract |
| description | TEXT | Job description |
| is_active | BOOLEAN | Whether job is visible to candidates |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### applications table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Candidate name |
| phone | TEXT | Phone number |
| email | TEXT | Email address |
| resume_path | TEXT | Storage path to resume |
| resume_original_name | TEXT | Original filename |
| job_id | UUID | Foreign key to jobs |
| note | TEXT | Optional candidate note |
| stage | TEXT | Application stage |
| created_at | TIMESTAMPTZ | Application timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Project URL and Anon Key

### 2. Enable Authentication
1. Go to Authentication > Providers
2. Ensure Email/Password is enabled

### 3. Create Admin User
1. Go to Authentication > Users
2. Click "Add User"
3. Enter:
   - Email: `admin@enter.in`
   - Password: `Admin@12345!`
4. Confirm the user

### 4. Run Database Migration
1. Go to SQL Editor
2. Paste the contents of `supabase/migrations/001_initial.sql`
3. Run the query

### 5. Seed Job Data
1. Go to SQL Editor
2. Paste the contents of `supabase/seed.sql`
3. Run the query

### 6. Create Storage Bucket
1. Go to Storage
2. Create a new bucket named `resumes`
3. Make it **private** (not public)

### 7. Configure Storage Policies
Run this SQL in the SQL Editor:

```sql
-- Allow public uploads to resumes bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

-- Allow authenticated users to read resumes
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete resumes
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
```

## Environment Variables

Create a `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

### SPA Routing

The `vercel.json` file handles SPA routing for direct URL access.

## URLs

- **Candidate Application**: `https://your-domain/apply`
- **Admin Login**: `https://your-domain/admin/login`
- **Admin Dashboard**: `https://your-domain/admin/dashboard`

## Admin Credentials

- **Email**: admin@enter.in
- **Password**: Admin@12345!

## Hiring Stages

- Applied (default for new applications)
- R1 (Round 1)
- R1 Reject
- R2 (Round 2)
- R2 Reject
- R3 (Round 3)
- R3 Reject
- Reject
- Approved

## Testing Checklist

1. Open `/apply` - verify page loads
2. Verify 10 seed jobs appear in dropdown
3. Fill out application form
4. Upload a PDF resume
5. Submit application
6. Verify success message
7. Login at `/admin/login`
8. Verify dashboard shows metrics
9. Navigate to Applications
10. Verify application appears
11. Test search functionality
12. Test job filter
13. Test stage filter
14. Change application stage
15. View candidate details modal
16. View/download resume
17. Navigate to Jobs
18. Create a new job
19. Edit an existing job
20. Deactivate a job
21. Verify deactivated job removed from candidate dropdown
22. Test logout
23. Verify admin routes are protected
24. Test mobile responsive layout

## Assumptions

- The assignment requested a temporary admin login - this is implemented as specified
- 10 realistic job seed data is provided as required
- No AI features are included as the requirements don't mandate them
- The application is designed for free deployment on Vercel + Supabase free tier
