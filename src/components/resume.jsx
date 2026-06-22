"use client";
import React, { useState, useRef } from "react";
import {
  LayoutGrid,
  MessageSquare,
  BarChart2,
  Map,
  User,
  Settings,
  Search,
  Bell,
  HelpCircle,
  UploadCloud,
  Code2,
  HeartHandshake,
  Shuffle,
  Zap,
} from "lucide-react";

export default function ResumeUploadPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Fresher / Graduate");
  const [interviewType, setInterviewType] = useState("Technical Assessment");
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, active: false },
    { label: "Interviews", icon: MessageSquare, active: true },
    { label: "Reports", icon: BarChart2, active: false },
    { label: "Learning Plan", icon: Map, active: false },
    { label: "Profile", icon: User, active: false },
    { label: "Settings", icon: Settings, active: false },
  ];

  const interviewTypes = [
    { label: "Technical Assessment", icon: Code2 },
    { label: "Behavioral Round", icon: HeartHandshake },
    { label: "Mixed Simulation", icon: Shuffle },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#F5F7FB] text-slate-800">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 sticky top-0 h-screen bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 pt-6 pb-5">
          <h1 className="text-xl font-bold text-blue-600">InterviewPro</h1>
          <p className="text-xs text-slate-500 mt-0.5">Enterprise Tier</p>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-1">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2"
                  : "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent pl-2"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm">
            New Interview
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top nav */}
        <header className="flex items-center justify-between gap-4 px-8 py-4 bg-[#F5F7FB]">
          <div className="relative w-full max-w-sm min-w-0">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button className="text-slate-500 hover:text-slate-700">
              <Bell size={20} />
            </button>
            <button className="text-slate-500 hover:text-slate-700">
              <HelpCircle size={20} />
            </button>
            <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-800">
              <svg
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <rect width="40" height="40" fill="#1e293b" />
                <circle cx="20" cy="15" r="7" fill="#cbd5e1" />
                <path d="M6 38c0-9 6-14 14-14s14 5 14 14" fill="#cbd5e1" />
              </svg>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 pb-10">
          <h2 className="text-3xl font-bold text-slate-900">Upload Your Resume</h2>
          <p className="text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Prepare for your dream role by uploading your latest resume and the
            target job description. Our AI will craft a personalized interview
            experience tailored to your career path.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload card */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`bg-white rounded-2xl border-2 border-dashed ${
                  isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200"
                } flex flex-col items-center justify-center text-center py-16 px-6 shadow-sm transition-colors`}
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <UploadCloud size={26} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Drag and drop your resume
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Supports PDF, DOCX (Max 10MB)
                </p>
                {fileName && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    {fileName}
                  </p>
                )}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="mt-5 bg-blue-50 text-blue-700 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Job description card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">
                  Job Description
                </h3>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job requirements here to customize your questions..."
                  className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
                <p className="text-xs text-slate-400 text-right mt-2">
                  Recommended: 100+ words for best accuracy.
                </p>
              </div>
            </div>

            {/* Right section */}
            <div className="space-y-6">
              {/* Interview setup card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-5">
                  Interview Setup
                </h3>

                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                >
                  <option>Fresher / Graduate</option>
                  <option>Junior</option>
                  <option>Mid-Level</option>
                  <option>Senior</option>
                </select>

                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Interview Type
                </label>
                <div className="space-y-2 mb-6">
                  {interviewTypes.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => setInterviewType(label)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        interviewType === label
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                  Generate Interview
                  <Zap size={16} />
                </button>

                <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
                  By clicking generate, you agree to our processing of your
                  data for training purposes.
                </p>
              </div>

              {/* Pro tip card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-slate-200 via-slate-100 to-blue-100 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-3 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-slate-400/40" />
                    <div className="w-8 h-8 rounded-md bg-blue-400/50" />
                    <div className="w-8 h-8 rounded-full border-4 border-slate-400/40" />
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-slate-900 mb-1">Pro Tip</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Mock interviews are most effective when you speak out
                    loud as if in a real call.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 px-8 py-5 flex items-center justify-between text-sm text-slate-500">
          <span>
            <strong className="text-slate-700">InterviewPro</strong> &nbsp;©
            2026 InterviewPro SaaS. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
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
    </div>
  );
}
