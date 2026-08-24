-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Public can view active jobs" ON jobs;
DROP POLICY IF EXISTS "Admin can manage jobs" ON jobs;
DROP POLICY IF EXISTS "Public can create applications" ON applications;
DROP POLICY IF EXISTS "Admin can view applications" ON applications;
DROP POLICY IF EXISTS "Admin can update applications" ON applications;
DROP POLICY IF EXISTS "Admin can delete applications" ON applications;

-- Ensure tables exist (skip if already created)
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

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(name) >= 2),
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  resume_path TEXT NOT NULL,
  resume_original_name TEXT,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  note TEXT,
  stage TEXT DEFAULT 'Applied' CHECK (stage IN ('Applied', 'Reject', 'R1', 'R1 Reject', 'R2', 'R2 Reject', 'R3', 'R3 Reject', 'Approved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Public can view active jobs" ON jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage jobs" ON jobs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public can create applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view applications" ON applications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can update applications" ON applications FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete applications" ON applications FOR DELETE USING (auth.role() = 'authenticated');

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can read resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete resumes" ON storage.objects;

CREATE POLICY "Anyone can upload resumes" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Admin can read resumes" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes');
CREATE POLICY "Admin can delete resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes');
