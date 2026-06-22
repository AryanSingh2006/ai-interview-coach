export const mockReportData = {
  metadata: {
    role: "Senior Frontend Engineer",
    completionDate: "May 24, 2026",
    status: "Strong Performance",
  },
  candidate: {
    name: "Alex",
    overallScore: 82,
    percentileTier: "top 15%",
    summary: "Your technical depth in React and system design was impressive. You demonstrated a clear ability to break down complex problems, though there are minor opportunities to refine your communication around architectural trade-offs."
  },
  coreMetrics: [
    { id: "tech-skills", label: "Technical Skills", score: 85, iconType: "code", description: "Excellent understanding of core algorithms and frameworks." },
    { id: "prob-solving", label: "Problem Solving", score: 78, iconType: "lightbulb", description: "Strong logical approach, occasionally missed edge cases." },
    { id: "communication", label: "Communication", score: 90, iconType: "chat", description: "Articulate and engaging during complex explanations." },
    { id: "confidence", label: "Confidence", score: 75, iconType: "shield", description: "Maintained steady composure, even during hard questions." }
  ],
  executiveSummary: [
    "The candidate exhibited a mastery of frontend architectural patterns, specifically regarding state management and component lifecycle optimization. Their ability to explain the virtual DOM and reconciliation process was top-tier. However, during the system design phase, the transition from monolithic to micro-frontend architectures could have been articulated with more specific examples of dependency management.",
    "Soft skills are a major asset for this candidate; they lead discussions with a collaborative tone and are receptive to real-time feedback and hints, showing high coachability."
  ],
  interviewerNotes: {
    interviewerInitials: "JD",
    interviewerName: "Jane Doe",
    interviewerTitle: "PRINCIPAL ENGINEER",
    quote: "Alex is a strong contender. Their technical foundation is rock solid. I'd like to see them take more initiative in the design phase, but overall, a very positive session."
  },
  marketBenchmark: {
    userScore: 82,
    averageScore: 64,
    percentileComparisonText: "Your performance exceeds 88% of candidates interviewed for similar Senior Frontend roles in the last 30 days."
  },
  strengths: [
    "Deep knowledge of React Hooks and context API.",
    "Excellent debugging speed and mental modeling.",
    "Active listening and clear articulation of thoughts.",
    "Consistent code quality and naming conventions."
  ],
  growthAreas: [
    "Edge case handling in recursive algorithms.",
    "Limited exposure to WebAssembly and low-level perf.",
    "Scalability trade-offs in distributed caching.",
    "Confidence when handling unfamiliar syntax."
  ]
};