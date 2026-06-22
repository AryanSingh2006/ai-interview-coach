"use client";
import React, { useState } from "react";
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

export default function InterviewSessionPage() {
  const [answer, setAnswer] = useState("");

  const historyItems = [
    {
      number: 1,
      title: "Introduction",
      preview: "Tell us about your background and experience...",
      status: "done",
    },
    {
      number: 2,
      title: "System Design",
      preview: "How would you scale a real-time notification...",
      status: "done",
    },
    {
      number: 4,
      title: "Architecture Principles",
      preview: null,
      status: "upcoming",
    },
    {
      number: 5,
      title: "Team Leadership",
      preview: null,
      status: "upcoming",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F7FB] text-slate-800 flex flex-col">
      {/* Top header */}
      <header className="flex items-center justify-between gap-4 px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-xl font-bold text-blue-600 flex-shrink-0">
            InterviewPro
          </span>
          <span className="h-5 w-px bg-slate-200 flex-shrink-0" />
          <span className="text-slate-600 text-sm truncate">
            Senior Software Engineer Interview
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold text-sm px-4 py-2 rounded-full">
            <Timer size={16} />
            <span>15:22</span>
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
          <span className="text-sm font-medium text-slate-700">
            Session Progress
          </span>
          <span className="text-sm font-semibold text-blue-600">
            Question 3 of 10
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: "30%" }} />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Current question card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-bold text-blue-600 tracking-wide mb-2">
                CURRENT QUESTION
              </p>
              <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3">
                Can you describe a challenging technical problem you solved
                recently?
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Focus on the specific architecture decisions, trade-offs
                made, and the measurable impact of your solution.
              </p>
            </div>

            {/* Interview history */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-slate-800">
                <History size={18} />
                <h3 className="font-semibold">Interview History</h3>
              </div>

              <div className="space-y-3">
                {historyItems.map((item) => (
                  <div
                    key={item.number}
                    className={`rounded-xl p-4 border ${
                      item.status === "done"
                        ? "bg-blue-50/60 border-slate-200"
                        : "border-dashed border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold ${
                          item.status === "done"
                            ? "text-emerald-700"
                            : "text-slate-400"
                        }`}
                      >
                        {item.number}. {item.title}
                      </span>
                      {item.status === "done" && (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      )}
                    </div>
                    {item.preview && (
                      <p className="text-sm text-slate-500 mt-1">
                        {item.preview}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
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

                <div className="flex items-center gap-6">
                  <button className="text-sm font-medium text-slate-600 hover:text-slate-800">
                    Save Draft
                  </button>
                  <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
                    Submit Answer
                  </button>
                </div>
              </div>
            </div>

            {/* Tip box */}
            <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
              <Lightbulb size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700 italic leading-relaxed">
                Tip: Use the <strong>STAR</strong> method (Situation, Task,
                Action, Result) to structure your response for maximum
                clarity.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-8 py-5 flex items-center justify-between text-sm text-slate-500 mt-auto">
        <span>© 2024 InterviewPro SaaS. All rights reserved.</span>
        <div className="flex items-center gap-6 flex-shrink-0">
          <a href="#" className="hover:text-slate-700">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-700">
            Terms of Service
          </a>
          <a href="#" className="hover:text-slate-700">
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
}
