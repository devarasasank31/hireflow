import { supabase } from "../lib/supabase";
import type { Application, HiringStage } from "../types";

export async function createApplication(app: {
  name: string;
  phone: string;
  email: string;
  resume_path: string;
  resume_original_name: string;
  job_id: string;
  note?: string;
}): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .insert({
      name: app.name,
      phone: app.phone,
      email: app.email,
      resume_path: app.resume_path,
      resume_original_name: app.resume_original_name,
      job_id: app.job_id,
      note: app.note || null,
      stage: "Applied",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateApplicationStage(
  id: string,
  stage: HiringStage
): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .update({ stage })
    .eq("id", id)
    .select("*, job:jobs(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getResumeSignedUrl(
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}

export async function downloadResume(
  path: string,
  fileName: string
): Promise<void> {
  const signedUrl = await getResumeSignedUrl(path);
  const link = document.createElement("a");
  link.href = signedUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function viewResume(path: string): Promise<void> {
  const signedUrl = await getResumeSignedUrl(path);
  window.open(signedUrl, "_blank");
}
