import { supabase } from "../lib/supabase";
import type { Job } from "../types";

export async function fetchActiveJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchAllJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createJob(
  job: Omit<Job, "id" | "created_at" | "updated_at">
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title: job.title,
      location: job.location,
      employment_type: job.employment_type,
      description: job.description,
      is_active: job.is_active,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateJob(
  id: string,
  job: Partial<Omit<Job, "id" | "created_at" | "updated_at">>
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .update(job)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleJobActive(
  id: string,
  isActive: boolean
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
