import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { fetchApplications } from "../services/applications";
import { formatDate, getStageColor } from "../utils/format";
import type { Application } from "../types";

export function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.stage === "Applied").length,
    inInterview: applications.filter(
      (a) => ["R1", "R2", "R3"].includes(a.stage)
    ).length,
    approved: applications.filter((a) => a.stage === "Approved").length,
    rejected: applications.filter(
      (a) =>
        a.stage === "Reject" ||
        a.stage === "R1 Reject" ||
        a.stage === "R2 Reject" ||
        a.stage === "R3 Reject"
    ).length,
  };

  const statCards = [
    { label: "Total Applications", value: stats.total, icon: Users, color: "bg-blue-500" },
    { label: "Applied", value: stats.applied, icon: Clock, color: "bg-yellow-500" },
    { label: "In Interview", value: stats.inInterview, icon: Briefcase, color: "bg-purple-500" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "bg-green-500" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-red-500" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your recruitment pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Applications</h2>
          <Link
            to="/admin/applications"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No applications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {app.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{app.name}</p>
                    <p className="text-sm text-gray-500 truncate">{app.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="hidden sm:inline text-sm text-gray-500">
                    {app.job?.title || "N/A"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(app.stage)}`}
                  >
                    {app.stage}
                  </span>
                  <span className="text-sm text-gray-400 hidden md:inline">
                    {formatDate(app.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
