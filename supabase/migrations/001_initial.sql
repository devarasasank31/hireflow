-- =============================================
-- ENTER RECRUITMENT - DATABASE MIGRATION
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- JOBS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Internship', 'Contract')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- APPLICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(name) >= 2),
  phone TEXT NOT NULL,
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  resume_path TEXT NOT NULL,
  resume_original_name TEXT,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  note TEXT,
  stage TEXT DEFAULT 'Applied' CHECK (stage IN ('Applied', 'Reject', 'R1', 'R1 Reject', 'R2', 'R2 Reject', 'R3', 'R3 Reject', 'Approved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Jobs policies
-- Public can read active jobs (for application form dropdown)
CREATE POLICY "Public can view active jobs"
  ON jobs FOR SELECT
  USING (is_active = true);

-- Authenticated admin can do everything with jobs
CREATE POLICY "Admin can manage jobs"
  ON jobs FOR ALL
  USING (auth.role() = 'authenticated');

-- Applications policies
-- Public can insert applications (candidate submission)
CREATE POLICY "Public can create applications"
  ON applications FOR INSERT
  WITH CHECK (true);

-- Public cannot read, update, or delete applications
-- (no SELECT, UPDATE, DELETE policies for anon)

-- Authenticated admin can read all applications
CREATE POLICY "Admin can view applications"
  ON applications FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated admin can update applications (stage changes)
CREATE POLICY "Admin can update applications"
  ON applications FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated admin can delete applications
CREATE POLICY "Admin can delete applications"
  ON applications FOR DELETE
  USING (auth.role() = 'authenticated');
