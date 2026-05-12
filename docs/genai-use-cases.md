# PrepWise — GenAI Use Case Document

## Overview
PrepWise integrates Generative AI (GenAI) at two critical points in the interview lifecycle, plus real-time voice AI for natural conversation simulation.

---

## Use Case 1: AI Interview Question Generation

**Azure Mapping**: Azure OpenAI Service (GPT-4o) — currently using Google Gemini 2.0 Flash

| Aspect | Details |
|---|---|
| **Trigger** | User completes voice conversation defining interview preferences |
| **Input** | Job role, experience level, tech stack, interview type, question count |
| **AI Service** | Google Gemini 2.0 Flash (`gemini-2.0-flash-001`) via `@ai-sdk/google` |
| **Output** | JSON array of tailored interview questions |
| **Storage** | Questions saved to Firestore `interviews` collection |

### Sample Prompt
```
Prepare questions for a job interview.
The job role is Senior Frontend Developer.
The job experience level is Mid-level.
The tech stack used in the job is: React, TypeScript, Next.js.
The focus between behavioural and technical questions should lean towards: technical.
The amount of questions required is: 5.
Please return only the questions, without any additional text.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]
```

### Sample Response
```json
[
  "Can you explain the difference between server-side rendering and static site generation in Next.js, and when would you choose one over the other?",
  "How do you manage global state in a large React application? Compare at least two approaches you have used.",
  "Describe how TypeScript generics work and give an example of when you used them to improve code reusability.",
  "Walk me through how you would optimize a Next.js application for performance, including code splitting, image optimization, and caching strategies.",
  "How do you handle error boundaries in React, and what strategies do you use for graceful error recovery in production?"
]
```

### Why This AI Service
- **Fast inference** (< 2 seconds for 5 questions)
- **Structured output** compatible with JSON parsing
- **Cost-effective** for text generation at scale
- **Azure Equivalent**: Azure OpenAI Service with GPT-4o can achieve the same with identical prompt engineering

---

## Use Case 2: AI Interview Feedback & Scoring

**Azure Mapping**: Azure OpenAI Service (GPT-4o) with Structured Outputs

| Aspect | Details |
|---|---|
| **Trigger** | Interview call ends, transcript captured |
| **Input** | Full interview transcript (user + AI messages) |
| **AI Service** | Google Gemini 2.0 Flash with `generateObject()` + Zod schema |
| **Output** | Structured feedback: scores, strengths, improvements, assessment |
| **Storage** | Feedback saved to Firestore `feedback` collection |

### Zod Validation Schema
```typescript
const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.array(z.object({
    name: z.string(),
    score: z.number(),
    comment: z.string(),
  })),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});
```

### Sample Output
```json
{
  "totalScore": 72,
  "categoryScores": [
    { "name": "Communication Skills", "score": 80, "comment": "Clear and articulate..." },
    { "name": "Technical Knowledge", "score": 65, "comment": "Good understanding..." },
    { "name": "Problem-Solving", "score": 70, "comment": "Logical approach..." },
    { "name": "Cultural & Role Fit", "score": 75, "comment": "Good alignment..." },
    { "name": "Confidence & Clarity", "score": 70, "comment": "Generally confident..." }
  ],
  "strengths": ["Strong communication", "Good problem decomposition"],
  "areasForImprovement": ["Deeper system design knowledge", "More specific examples"],
  "finalAssessment": "The candidate shows promise but needs to strengthen..."
}
```

### Why This AI Service
- **Structured output mode** ensures valid JSON matching our schema
- **Comprehensive analysis** across 5 evaluation categories
- **Consistent scoring** via detailed system prompts
- **Azure Equivalent**: Azure OpenAI with `response_format: { type: "json_schema" }`

---

## Use Case 3: Real-Time Voice AI Interview Simulation

**Azure Mapping**: Azure AI Speech (Speech-to-Text + Text-to-Speech) + Azure OpenAI

| Aspect | Details |
|---|---|
| **Trigger** | User clicks "Call" button |
| **Service** | Vapi AI — Voice AI Platform |
| **Function** | Real-time voice conversation with AI interviewer |
| **Features** | Speech-to-text, AI response generation, text-to-speech, turn detection |
| **Integration** | `@vapi-ai/web` SDK on client-side |

### Why Vapi (vs Azure Speech)
- **Turnkey solution**: Combined STT + LLM + TTS in one API call
- **Real-time WebSocket**: Sub-second latency for natural conversation
- **Built-in interview personas**: Configurable voice, personality, and behavior
- **Azure Equivalent**: Would require stitching Azure Speech SDK + Azure OpenAI + custom WebSocket orchestration

---

## Azure Services Mapping Summary

| PrepWise Component | Current Service | Azure Equivalent |
|---|---|---|
| Question Generation | Google Gemini | Azure OpenAI Service (GPT-4o) |
| Feedback Analysis | Google Gemini (Structured) | Azure OpenAI (JSON Schema mode) |
| Voice AI | Vapi Platform | Azure AI Speech + Azure OpenAI |
| Database | Cloud Firestore | Azure Cosmos DB |
| Authentication | Firebase Auth | Azure AD B2C |
| Hosting | Vercel | Azure App Service / AKS |
| Container Registry | — | Azure Container Registry (ACR) |
| Orchestration | — | Azure Kubernetes Service (AKS) |
| Secrets | .env.local | Azure Key Vault |
| CI/CD | GitHub Actions | Azure DevOps / GitHub Actions |
| Monitoring | — | Azure Monitor + App Insights |
