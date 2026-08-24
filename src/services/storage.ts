import { supabase } from "../lib/supabase";
import { RESUME_BUCKET, MAX_FILE_SIZE, ALLOWED_FILE_TYPES, ALLOWED_EXTENSIONS } from "../lib/constants";

export interface ValidationError {
  message: string;
}

export function validateResumeFile(file: File): ValidationError | null {
  if (!file) {
    return { message: "Please select a resume file." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { message: "File size must be under 5 MB." };
  }

  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { message: "Please upload a PDF, DOC, or DOCX file." };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== "") {
    return { message: "Invalid file type. Please upload a PDF, DOC, or DOCX file." };
  }

  return null;
}

export async function uploadResume(
  file: File,
  applicationId: string
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const path = `${applicationId}/${uniqueName}`;

  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw error;
  return path;
}

export async function deleteResume(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .remove([path]);

  if (error) throw error;
}
