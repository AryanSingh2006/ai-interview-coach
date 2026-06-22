"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Timer,
  HelpCircle,
  Settings,
  History,
  CheckCircle2,
  Bold,
  List,
  Code2,
  Mic,
  Lightbulb,
} from "lucide-react";

const MAX_QUESTIONS = 15;

function InterviewSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  const [answer, setAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [historyItems, setHistoryItems] = useState([]);
  const [interviewType, setInterviewType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Timer state
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Load session on mount
  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided.");
      setIsLoading(false);
      return;
    }

    async function loadSession() {
      try {
        const res = await fetch(`/api/interview/${sessionId}/session`);
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to load session."); return; }
        if (data.completed) {
          router.replace(`/interview-feedback?sessionId=${sessionId}`);
          return;
        }
        setCurrentQuestion(data.currentQuestion);
        setAnsweredCount(data.answeredQuestions || 0);
        setInterviewType(data.interviewType || "");
      } catch {
        setError("Network error loading session.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [sessionId, router]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    if (!currentQuestion) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/interview/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to submit answer."); return; }

      // Add answered question to history
      setHistoryItems((prev) => [
        ...prev,
        { index: currentQuestion.index, question: currentQuestion.question },
      ]);
      setAnsweredCount((c) => c + 1);
      setAnswer("");

      if (data.readyForCompletion) {
        // Complete the interview
        const completeRes = await fetch(`/api/interview/${sessionId}/complete`, {
          method: "POST",
        });
        const completeData = await completeRes.json();
        if (!completeRes.ok) { setError(completeData.error || "Failed to complete interview."); return; }
        router.push(`/interview-feedback?sessionId=${sessionId}`);
        return;
      }

      // Advance to next question
      setCurrentQuestion({
        question: data.nextQuestion,
        questionType: data.questionType,
        index: data.turnIndex,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionNumber = answeredCount + 1;
  const progressPercent = Math.round((answeredCount / MAX_QUESTIONS) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F7FB] text-slate-800 flex flex-col">
      {/* Top header */}
      <header className="flex items-center justify-between gap-4 px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-xl font-bold text-blue-600 flex-shrink-0">
            InterviewPro
          </span>
          <span className="h-5 w-px bg-slate-200 flex-shrink-0" />
          <span className="text-slate-600 text-sm truncate capitalize">
            {interviewType ? `${interviewType} Interview` : "Interview Session"}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold text-sm px-4 py-2 rounded-full">
            <Timer size={16} />
            <span>{formatTime(elapsed)}</span>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
            <HelpCircle size={20} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Session Progress</span>
          <span className="text-sm font-semibold text-blue-600">
            Question {questionNumber} of {MAX_QUESTIONS}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Current question card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-bold text-blue-600 tracking-wide mb-2">CURRENT QUESTION</p>
              <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3">
                {currentQuestion?.question || "Loading question..."}
              </h2>
              {currentQuestion?.questionType && (
                <span className="inline-block text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full capitalize">
                  {currentQuestion.questionType}
                </span>
              )}
            </div>

            {/* Interview history */}
            {historyItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 text-slate-800">
                  <History size={18} />
                  <h3 className="font-semibold">Interview History</h3>
                </div>
                <div className="space-y-3">
                  {historyItems.map((item) => (
                    <div
                      key={item.index}
                      className="rounded-xl p-4 border bg-blue-50/60 border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-700">
                          Q{item.index + 1}. Answered
                        </span>
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      </div>
                      <p className="text-sm text-slate-500 mt-1 truncate">{item.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-slate-700 hover:bg-blue-100">
                    <Bold size={16} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-slate-700 hover:bg-blue-100">
                    <List size={16} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-slate-700 hover:bg-blue-100">
                    <Code2 size={16} />
                  </button>
                </div>
                <span className="text-sm text-slate-500 flex-shrink-0">
                  Character count: {answer.length}
                </span>
              </div>

              {/* Textarea */}
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your detailed technical response here..."
                className="w-full h-[480px] p-6 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none"
              />

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-slate-200">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-3 rounded-xl transition-colors">
                  <Mic size={16} />
                  Voice Input
                </button>

                <div className="flex items-center gap-4">
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !answer.trim()}
                    className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Answer"}
                  </button>
                </div>
              </div>
            </div>

            {/* Tip box */}
            <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
              <Lightbulb size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700 italic leading-relaxed">
                Tip: Use the <strong>STAR</strong> method (Situation, Task, Action, Result) to
                structure your response for maximum clarity.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-8 py-5 flex items-center justify-between text-sm text-slate-500 mt-auto">
        <span>© 2026 InterviewPro SaaS. All rights reserved.</span>
        <div className="flex items-center gap-6 flex-shrink-0">
          <span className="cursor-default opacity-60">Privacy Policy</span>
          <span className="cursor-default opacity-60">Terms of Service</span>
          <span className="cursor-default opacity-60">Contact Us</span>
        </div>
      </footer>
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InterviewSession />
    </Suspense>
  );
}
