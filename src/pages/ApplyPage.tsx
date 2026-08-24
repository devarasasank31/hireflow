import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, X, Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import { fetchActiveJobs } from "../services/jobs";
import { createApplication } from "../services/applications";
import { uploadResume, validateResumeFile } from "../services/storage";
import { formatFileSize } from "../utils/format";
import type { Job } from "../types";

const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(1, "Phone is required").regex(/^[\d\s\-\+\(\)]{7,20}$/, "Please enter a valid phone number"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  job_id: z.string().min(1, "Please select a job"),
  note: z.string().max(1000, "Note must be under 1000 characters").optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export function ApplyPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    fetchActiveJobs()
      .then(setJobs)
      .catch(() => toast.error("Unable to load jobs. Please refresh the page."))
      .finally(() => setJobsLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateResumeFile(file);
      if (validationError) {
        toast.error(validationError.message);
        e.target.value = "";
        return;
      }
      setResumeFile(file);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    const input = document.getElementById("resume") as HTMLInputElement;
    if (input) input.value = "";
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!resumeFile) {
      toast.error("Please upload your resume.");
      return;
    }

    setSubmitting(true);

    try {
      const tempId = crypto.randomUUID();

      const resumePath = await uploadResume(resumeFile, tempId);

      try {
        await createApplication({
          name: data.name,
          phone: data.phone,
          email: data.email,
          resume_path: resumePath,
          resume_original_name: resumeFile.name,
          job_id: data.job_id,
          note: data.note,
        });
      } catch (dbError) {
        try {
          const { deleteResume } = await import("../services/storage");
          await deleteResume(resumePath);
        } catch {
          // Cleanup failed, but we still need to show error
        }
        throw dbError;
      }

      setSubmitted(true);
      reset();
      setResumeFile(null);
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Your application has been received. Our team will review it and get
            back to you soon.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-gray-900" />
            <span className="text-lg font-bold text-gray-900">ENTER</span>
            <span className="text-lg text-gray-500">Recruitment</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply for a Position
          </h1>
          <p className="text-gray-600">
            Submit your application and our team will review it.
          </p>
          {!jobsLoading && (
            <p className="text-sm text-gray-500 mt-2">
              {jobs.length} open position{jobs.length !== 1 ? "s" : ""} available
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
              Resume <span className="text-red-500">*</span>
            </label>
            {!resumeFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 5 MB)</p>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden" }}
                />
                <label
                  htmlFor="resume"
                  className="mt-3 inline-block px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Choose File
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">
                      {resumeFile.name.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(resumeFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="job_id" className="block text-sm font-medium text-gray-700 mb-1">
              Select Job <span className="text-red-500">*</span>
            </label>
            <select
              id="job_id"
              {...register("job_id")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              disabled={jobsLoading}
            >
              <option value="">
                {jobsLoading ? "Loading jobs..." : "Select a position"}
              </option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.location}
                </option>
              ))}
            </select>
            {errors.job_id && (
              <p className="mt-1 text-sm text-red-600">{errors.job_id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Brief Note <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="note"
              {...register("note")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              placeholder="Tell us anything else you'd like us to know..."
            />
            {errors.note && (
              <p className="mt-1 text-sm text-red-600">{errors.note.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
