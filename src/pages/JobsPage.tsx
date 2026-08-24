import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  X,
  Loader2,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchAllJobs,
  createJob,
  updateJob,
  toggleJobActive,
} from "../services/jobs";
import { fetchApplications } from "../services/applications";
import { formatDate } from "../utils/format";
import { EMPLOYMENT_TYPES } from "../types";
import type { Job, Application } from "../types";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  description: z.string().max(1000, "Description must be under 1000 characters").optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  useEffect(() => {
    Promise.all([fetchAllJobs(), fetchApplications()])
      .then(([jbs, apps]) => {
        setJobs(jbs);
        setApplications(apps);
      })
      .catch(() => toast.error("Unable to load jobs. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const getJobApplicationCount = (jobId: string) => {
    return applications.filter((a) => a.job_id === jobId).length;
  };

  const openCreateModal = () => {
    setEditingJob(null);
    reset({ title: "", location: "", employment_type: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    reset({
      title: job.title,
      location: job.location,
      employment_type: job.employment_type,
      description: job.description || "",
    });
    setShowModal(true);
  };

  const onSubmit = async (data: JobFormData) => {
    setSubmitting(true);
    try {
      if (editingJob) {
        const updated = await updateJob(editingJob.id, {
          title: data.title,
          location: data.location,
          employment_type: data.employment_type,
          description: data.description || null,
        });
        setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? updated : j)));
        toast.success("Job updated successfully.");
      } else {
        const created = await createJob({
          title: data.title,
          location: data.location,
          employment_type: data.employment_type,
          description: data.description || null,
          is_active: true,
        } as any);
        setJobs((prev) => [created, ...prev]);
        toast.success("Job created successfully.");
      }
      setShowModal(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save job."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (job: Job) => {
    try {
      const updated = await toggleJobActive(job.id, !job.is_active);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      toast.success(
        `Job ${updated.is_active ? "activated" : "deactivated"} successfully.`
      );
    } catch {
      toast.error("Failed to update job status.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">Manage job postings</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No jobs found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Job Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Applications</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{job.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.employment_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getJobApplicationCount(job.id)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {job.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(job)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(job)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title={job.is_active ? "Deactivate" : "Activate"}
                          >
                            {job.is_active ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-gray-900">{job.title}</p>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {job.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{job.location} &middot; {job.employment_type}</p>
                <p className="text-sm text-gray-500 mb-3">
                  {getJobApplicationCount(job.id)} application{getJobApplicationCount(job.id) !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(job)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(job)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                  >
                    {job.is_active ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {editingJob ? "Edit Job" : "Create Job"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("title")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Job title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("location")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g. Bangalore, India"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("employment_type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.employment_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.employment_type.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Brief job description..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingJob ? (
                    "Update Job"
                  ) : (
                    "Create Job"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
