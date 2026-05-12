import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getUserAnalytics,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview, analytics] = await Promise.all([
    getInterviewsByUserId(user?.id || ""),
    getLatestInterviews({ userId: user?.id || "" }),
    getUserAnalytics(user?.id || ""),
  ]);

  const hasPastInterviews = userInterviews && userInterviews.length > 0;
  const hasUpcomingInterviews = allInterview && allInterview.length > 0;

  return (
    <>
      {/* Hero CTA */}
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>
            Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
          </h2>
          <p className="text-lg">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      {/* Analytics Section */}
      {analytics.totalInterviews > 0 && (
        <section className="flex flex-col gap-5 mt-8">
          <h2>Your Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Interviews */}
            <div className="glass-card bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
              <p className="text-light-400 text-xs uppercase tracking-wider">
                Interviews Taken
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {analytics.totalInterviews}
              </p>
            </div>

            {/* Average Score */}
            <div className="glass-card bg-gradient-to-br from-purple-500/15 to-purple-600/5 border border-purple-500/20 rounded-xl p-5">
              <p className="text-light-400 text-xs uppercase tracking-wider">
                Average Score
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                <span
                  className={
                    analytics.averageScore >= 70
                      ? "text-success-100"
                      : analytics.averageScore >= 40
                      ? "text-amber-400"
                      : "text-destructive-100"
                  }
                >
                  {analytics.averageScore}
                </span>
                <span className="text-base text-light-400">/100</span>
              </p>
            </div>

            {/* Best Category */}
            <div className="glass-card bg-gradient-to-br from-green-500/15 to-green-600/5 border border-green-500/20 rounded-xl p-5">
              <p className="text-light-400 text-xs uppercase tracking-wider">
                Strongest Skill
              </p>
              <p className="text-lg font-semibold text-success-100 mt-2 truncate">
                {analytics.bestCategory}
              </p>
            </div>

            {/* Latest Score */}
            <div className="glass-card bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
              <p className="text-light-400 text-xs uppercase tracking-wider">
                Latest Score
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {analytics.latestScore !== null ? (
                  <>
                    <span
                      className={
                        analytics.latestScore >= 70
                          ? "text-success-100"
                          : analytics.latestScore >= 40
                          ? "text-amber-400"
                          : "text-destructive-100"
                      }
                    >
                      {analytics.latestScore}
                    </span>
                    <span className="text-base text-light-400">/100</span>
                  </>
                ) : (
                  <span className="text-light-600">—</span>
                )}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          {analytics.categoryAverages.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">
                Skills Breakdown
              </h3>
              <div className="flex flex-col gap-3">
                {analytics.categoryAverages.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-4">
                    <span className="text-sm text-light-100 w-44 shrink-0 truncate">
                      {cat.name}
                    </span>
                    <div className="flex-1 bg-dark-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          cat.avgScore >= 70
                            ? "bg-gradient-to-r from-success-100 to-success-200"
                            : cat.avgScore >= 40
                            ? "bg-gradient-to-r from-amber-400 to-amber-500"
                            : "bg-gradient-to-r from-destructive-100 to-destructive-200"
                        }`}
                        style={{ width: `${cat.avgScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-10 text-right">
                      {cat.avgScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Scores */}
          {analytics.recentScores.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">
                Recent Interview Scores
              </h3>
              <div className="flex flex-wrap gap-3">
                {analytics.recentScores.map((item, i) => (
                  <div
                    key={i}
                    className="bg-dark-200/50 rounded-lg p-3 border border-white/5 min-w-[140px]"
                  >
                    <p className="text-xs text-light-400 capitalize truncate">
                      {item.role}
                    </p>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        item.score >= 70
                          ? "text-success-100"
                          : item.score >= 40
                          ? "text-amber-400"
                          : "text-destructive-100"
                      }`}
                    >
                      {item.score}
                    </p>
                    <p className="text-[10px] text-light-600 mt-1">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Your Interviews */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
              />
            ))
          ) : (
            <p className="text-gray-400">
              You haven&apos;t taken any interviews yet. Start one above to
              begin practicing! 🚀
            </p>
          )}
        </div>
      </section>

      {/* Community Interviews */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
              />
            ))
          ) : (
            <p className="text-gray-400">
              No community interviews available yet. Create one and it&apos;ll
              appear here for others!
            </p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;