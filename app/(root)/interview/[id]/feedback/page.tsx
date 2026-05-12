import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DownloadFeedback from "@/components/DownloadFeedback";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id, user.id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  if (!feedback) redirect("/");

  const scoreColor =
    feedback.totalScore >= 70
      ? "text-success-100"
      : feedback.totalScore >= 40
      ? "text-amber-400"
      : "text-destructive-100";

  const scoreBg =
    feedback.totalScore >= 70
      ? "from-success-100/20 to-success-200/5"
      : feedback.totalScore >= 40
      ? "from-amber-400/20 to-amber-500/5"
      : "from-destructive-100/20 to-destructive-200/5";

  return (
    <section className="section-feedback animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-center">
          <span className="capitalize">{interview.role}</span> Interview Feedback
        </h1>

        {/* Score Ring */}
        <div
          className={`relative size-28 rounded-full bg-gradient-to-br ${scoreBg} flex items-center justify-center ring-2 ring-white/10`}
        >
          <div className="text-center">
            <p className={`text-3xl font-bold ${scoreColor}`}>
              {feedback.totalScore}
            </p>
            <p className="text-[10px] text-light-400 uppercase tracking-wider">
              / 100
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-light-400">
          <div className="flex items-center gap-1.5">
            <Image src="/calendar.svg" width={16} height={16} alt="calendar" />
            <span>
              {feedback.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </span>
          </div>
          <DownloadFeedback feedback={feedback} role={interview.role} />
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Final Assessment */}
      <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
        <h3 className="text-base font-semibold mb-2 text-primary-100">
          💡 Final Assessment
        </h3>
        <p className="text-light-100 leading-relaxed">
          {feedback.finalAssessment}
        </p>
      </div>

      {/* Category Scores */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl">Category Breakdown</h2>
        {feedback.categoryScores?.map((category, index) => {
          const catColor =
            category.score >= 70
              ? "from-success-100 to-success-200"
              : category.score >= 40
              ? "from-amber-400 to-amber-500"
              : "from-destructive-100 to-destructive-200";

          return (
            <div
              key={index}
              className="glass-card rounded-xl p-4 border border-white/[0.04]"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-white text-sm">
                  {category.name}
                </p>
                <span
                  className={`text-sm font-bold ${
                    category.score >= 70
                      ? "text-success-100"
                      : category.score >= 40
                      ? "text-amber-400"
                      : "text-destructive-100"
                  }`}
                >
                  {category.score}/100
                </span>
              </div>
              <div className="w-full bg-dark-200 rounded-full h-2 mb-2">
                <div
                  className={`bg-gradient-to-r ${catColor} h-2 rounded-full transition-all duration-700`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
              <p className="text-xs text-light-400">{category.comment}</p>
            </div>
          );
        })}
      </div>

      {/* Strengths & Improvements side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5 border border-success-100/10">
          <h3 className="text-base font-semibold mb-3 text-success-100">
            ✅ Strengths
          </h3>
          <ul className="flex flex-col gap-2">
            {feedback.strengths?.map((strength, index) => (
              <li
                key={index}
                className="text-sm text-light-100 flex items-start gap-2"
              >
                <span className="text-success-100 mt-0.5">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-xl p-5 border border-amber-400/10">
          <h3 className="text-base font-semibold mb-3 text-amber-400">
            🔧 Areas for Improvement
          </h3>
          <ul className="flex flex-col gap-2">
            {feedback.areasForImprovement?.map((area, index) => (
              <li
                key={index}
                className="text-sm text-light-100 flex items-start gap-2"
              >
                <span className="text-amber-400 mt-0.5">•</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to Dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              🔄 Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;