export interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  name: string;
  phone: string;
  email: string;
  resume_path: string;
  resume_original_name: string | null;
  job_id: string;
  note: string | null;
  stage: string;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export type HiringStage =
  | "Applied"
  | "Reject"
  | "R1"
  | "R1 Reject"
  | "R2"
  | "R2 Reject"
  | "R3"
  | "R3 Reject"
  | "Approved";

export const HIRING_STAGES: HiringStage[] = [
  "Applied",
  "R1",
  "R1 Reject",
  "R2",
  "R2 Reject",
  "R3",
  "R3 Reject",
  "Reject",
  "Approved",
];

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
