import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  FileText,
  Eye,
  Download,
  Trash2,
  Loader2,
  User,
  Phone,
  Briefcase,
  Calendar,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchApplications,
  updateApplicationStage,
  deleteApplication,
  viewResume,
  downloadResume,
} from "../services/applications";
import { fetchAllJobs } from "../services/jobs";
import { formatDate, getStageColor } from "../utils/format";
import { HIRING_STAGES } from "../types";
import type { Application, Job, HiringStage } from "../types";

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchApplications(), fetchAllJobs()])
      .then(([apps, jbs]) => {
        setApplications(apps);
        setJobs(jbs);
      })
      .catch(() => toast.error("Unable to load data. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        app.phone.includes(search);

      const matchJob = filterJob === "all" || app.job_id === filterJob;
      const matchStage = filterStage === "all" || app.stage === filterStage;

      return matchSearch && matchJob && matchStage;
    });
  }, [applications, search, filterJob, filterStage]);

  const handleStageChange = async (appId: string, newStage: string) => {
    setUpdatingStage(true);
    try {
      const updated = await updateApplicationStage(appId, newStage as HiringStage);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? updated : a))
      );
      if (selectedApp?.id === appId) {
        setSelectedApp({ ...selectedApp, stage: newStage });
      }
      toast.success("Application stage updated.");
    } catch {
      toast.error("Failed to update stage. Please try again.");
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    setDeletingId(appId);
    try {
      await deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      if (selectedApp?.id === appId) setSelectedApp(null);
      toast.success("Application deleted.");
    } catch {
      toast.error("Failed to delete application.");
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterJob("all");
    setFilterStage("all");
  };

  const hasFilters = search || filterJob !== "all" || filterStage !== "all";

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">Manage candidate applications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={filterJob}
          onChange={(e) => setFilterJob(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="all">All Jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="all">All Stages</option>
          {HIRING_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        {filtered.length} application{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No applications found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Job</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stage</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Applied</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-left hover:underline"
                        >
                          <p className="font-medium text-gray-900">{app.name}</p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{app.job?.title || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{app.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{app.phone}</td>
                      <td className="px-4 py-3">
                        <select
                          value={app.stage}
                          onChange={(e) => handleStageChange(app.id, e.target.value)}
                          disabled={updatingStage}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-gray-900 ${getStageColor(app.stage)}`}
                        >
                          {HIRING_STAGES.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => viewResume(app.resume_path)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Resume"
                          >
                            <FileText className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() =>
                              downloadResume(app.resume_path, app.resume_original_name || "resume")
                            }
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download Resume"
                          >
                            <Download className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            disabled={deletingId === app.id}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            {deletingId === app.id ? (
                              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-500" />
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
            {filtered.map((app) => (
              <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-left"
                  >
                    <p className="font-medium text-gray-900">{app.name}</p>
                    <p className="text-sm text-gray-500">{app.email}</p>
                  </button>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(app.stage)}`}
                  >
                    {app.stage}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{app.job?.title || "N/A"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDate(app.created_at)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => viewResume(app.resume_path)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Candidate Details</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedApp.name}</p>
                  <p className="text-sm text-gray-500">{selectedApp.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedApp.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedApp.job?.title || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatDate(selectedApp.created_at)}</span>
                </div>
              </div>

              {selectedApp.note && (
                <div className="flex items-start gap-2">
                  <StickyNote className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{selectedApp.note}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Stage
                </label>
                <select
                  value={selectedApp.stage}
                  onChange={(e) => handleStageChange(selectedApp.id, e.target.value)}
                  disabled={updatingStage}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {HIRING_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => viewResume(selectedApp.resume_path)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Resume
                </button>
                <button
                  onClick={() =>
                    downloadResume(
                      selectedApp.resume_path,
                      selectedApp.resume_original_name || "resume"
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
