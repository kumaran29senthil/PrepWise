import Link from "next/link";

import {
  getAdminStats,
  getAllInterviews,
} from "@/lib/actions/general.action";
import { getAllUsers } from "@/lib/actions/auth.action";

const AdminPage = async () => {
  const [stats, users, interviews] = await Promise.all([
    getAdminStats(),
    getAllUsers(),
    getAllInterviews(),
  ]);

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats.totalUsers}
          gradient="from-[#3B82F6]/20 via-[#3B82F6]/5 to-transparent"
          ring="ring-[#3B82F6]/20"
        />
        <StatCard
          icon="🎤"
          label="Interviews"
          value={stats.totalInterviews}
          gradient="from-[#8B5CF6]/20 via-[#8B5CF6]/5 to-transparent"
          ring="ring-[#8B5CF6]/20"
        />
        <StatCard
          icon="📊"
          label="Feedbacks"
          value={stats.totalFeedbacks}
          gradient="from-[#10B981]/20 via-[#10B981]/5 to-transparent"
          ring="ring-[#10B981]/20"
        />
        <StatCard
          icon="⭐"
          label="Avg Score"
          value={stats.averageScore > 0 ? `${stats.averageScore}/100` : "N/A"}
          gradient="from-[#F59E0B]/20 via-[#F59E0B]/5 to-transparent"
          ring="ring-[#F59E0B]/20"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Panel */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              👥 Users
              <span className="text-[10px] bg-primary-200/15 text-primary-200 px-2 py-0.5 rounded-full font-medium">
                {users.length}
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
              >
                {/* Avatar */}
                <div className="size-10 rounded-full bg-gradient-to-br from-primary-200 to-primary-100 flex items-center justify-center text-dark-100 text-xs font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name}
                    </p>
                    {user.isAdmin && (
                      <span className="text-[9px] bg-primary-200/20 text-primary-200 px-1.5 py-0.5 rounded-full">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-light-400 truncate">
                    {user.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">
                    {user.interviewCount}
                  </p>
                  <p className="text-[10px] text-light-600">interviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent">
          <h2 className="text-lg font-semibold mb-5">📈 Platform Overview</h2>

          <div className="flex flex-col gap-4">
            {/* Completion Rate */}
            <div className="p-4 rounded-xl bg-dark-200/40">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-light-100">Completion Rate</p>
                <p className="text-sm font-bold text-white">
                  {stats.totalInterviews > 0
                    ? Math.round(
                        (stats.totalFeedbacks / stats.totalInterviews) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-200 to-primary-100 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      stats.totalInterviews > 0
                        ? Math.round(
                            (stats.totalFeedbacks / stats.totalInterviews) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Avg Score Distribution */}
            <div className="p-4 rounded-xl bg-dark-200/40">
              <p className="text-sm text-light-100 mb-3">Score Distribution</p>
              <div className="flex items-end gap-1 h-16">
                {[20, 40, 55, 70, 85, 65, 45, 30].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-primary-200/60 to-primary-100/30 rounded-t transition-all hover:from-primary-200 hover:to-primary-100"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Active Users */}
            <div className="p-4 rounded-xl bg-dark-200/40">
              <div className="flex justify-between items-center">
                <p className="text-sm text-light-100">Active Users</p>
                <p className="text-2xl font-bold text-success-100">
                  {users.filter((u) => u.interviewCount > 0).length}
                </p>
              </div>
              <p className="text-xs text-light-600 mt-1">
                Users who have taken at least 1 interview
              </p>
            </div>

            {/* Admin Count */}
            <div className="p-4 rounded-xl bg-dark-200/40">
              <div className="flex justify-between items-center">
                <p className="text-sm text-light-100">Admins</p>
                <p className="text-2xl font-bold text-primary-200">
                  {users.filter((u) => u.isAdmin).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Interviews Table */}
      <div className="glass-card rounded-2xl p-6 border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🎤 All Interviews
            <span className="text-[10px] bg-primary-200/15 text-primary-200 px-2 py-0.5 rounded-full font-medium">
              {interviews.length}
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Type</th>
                <th>Level</th>
                <th>Candidate</th>
                <th>Score</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-light-400 py-10">
                    <span className="text-3xl block mb-2">🎯</span>
                    No interviews yet. Users need to start one!
                  </td>
                </tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-primary-200/20 to-primary-100/10 flex items-center justify-center text-xs">
                          💼
                        </div>
                        <span className="font-medium text-white capitalize">
                          {interview.role}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${
                          interview.type.toLowerCase().includes("tech")
                            ? "bg-blue-500/15 text-blue-400"
                            : interview.type.toLowerCase().includes("behav")
                            ? "bg-green-500/15 text-green-400"
                            : "bg-purple-500/15 text-purple-400"
                        }`}
                      >
                        {interview.type}
                      </span>
                    </td>
                    <td className="capitalize text-light-400 text-sm">
                      {interview.level}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-light-800 flex items-center justify-center text-[10px] text-white">
                          {interview.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-light-100">
                          {interview.userName}
                        </span>
                      </div>
                    </td>
                    <td>
                      {interview.score !== null ? (
                        <span
                          className={`text-sm font-bold ${
                            interview.score >= 70
                              ? "text-success-100"
                              : interview.score >= 40
                              ? "text-amber-400"
                              : "text-destructive-100"
                          }`}
                        >
                          {interview.score}
                        </span>
                      ) : (
                        <span className="text-light-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="text-light-400 text-xs">
                      {interview.createdAt
                        ? new Date(interview.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : "—"}
                    </td>
                    <td>
                      {interview.finalized ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-success-100/15 text-success-100 px-2 py-1 rounded-full">
                          <span className="size-1.5 rounded-full bg-success-100 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-1 rounded-full">
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="flex justify-center pb-4">
        <Link
          href="/"
          className="text-sm text-light-400 hover:text-primary-200 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  gradient,
  ring,
}: {
  icon: string;
  label: string;
  value: string | number;
  gradient: string;
  ring: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} ${ring} ring-1 transition-all hover:scale-[1.02] hover:ring-2`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-light-400 font-medium">
            {label}
          </p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
      {/* Decorative glow */}
      <div className="absolute -bottom-4 -right-4 size-20 rounded-full bg-white/[0.03] blur-xl" />
    </div>
  );
}

export default AdminPage;
