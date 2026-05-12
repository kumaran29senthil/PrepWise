interface Feedback {
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  coverImage?: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  isAdmin?: boolean;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  coverImage?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}

// ─── Admin Types ───────────────────────────────────

interface AdminStats {
  totalUsers: number;
  totalInterviews: number;
  totalFeedbacks: number;
  averageScore: number;
}

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  interviewCount: number;
  avgScore: number;
}

interface AdminInterviewRow {
  id: string;
  role: string;
  type: string;
  level: string;
  techstack: string[];
  userId: string;
  userName: string;
  createdAt: string;
  score: number | null;
  finalized: boolean;
}

// ─── User Analytics Types ──────────────────────────

interface UserAnalytics {
  totalInterviews: number;
  averageScore: number;
  bestCategory: string;
  latestScore: number | null;
  categoryAverages: Array<{
    name: string;
    avgScore: number;
  }>;
  recentScores: Array<{
    date: string;
    score: number;
    role: string;
  }>;
}
