"use client";
import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";


export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setApiError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setApiError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setApiError("Password must be at least 6 characters.");
      return;
    }
    if (!agreed) {
      setApiError("You must agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message || "Signup failed. Please try again.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setApiError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F1F3F8] p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left panel */}
        <div className="md:w-[46%] bg-gradient-to-br from-[#E2E6FB] to-[#DCE2FA] p-10 flex flex-col">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 size={18} className="text-blue-600" />
            </div>
            <span className="text-xl font-bold text-blue-700">InterviewPro</span>
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-5">
            Master your next
            <br />
            career move.
          </h1>
          <p className="text-blue-700/80 text-base leading-relaxed max-w-sm">
            Join thousands of professionals using InterviewPro to simulate
            real-world interviews, receive AI-driven feedback, and land their
            dream roles.
          </p>

          <div className="mt-auto pt-10">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 aspect-[16/10] relative shadow-lg">
              <svg
                viewBox="0 0 400 250"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* background stars */}
                <circle cx="40" cy="30" r="1.2" fill="#94a3b8" opacity="0.6" />
                <circle cx="90" cy="60" r="1" fill="#94a3b8" opacity="0.5" />
                <circle cx="320" cy="40" r="1.5" fill="#94a3b8" opacity="0.6" />
                <circle cx="350" cy="90" r="1" fill="#94a3b8" opacity="0.5" />
                <circle cx="280" cy="20" r="1" fill="#94a3b8" opacity="0.4" />

                {/* platform */}
                <polygon
                  points="60,200 200,160 340,200 200,240"
                  fill="#14b8a6"
                  opacity="0.9"
                />
                <polygon
                  points="60,200 200,160 200,170 60,210"
                  fill="#0d9488"
                />
                <polygon
                  points="340,200 200,160 200,170 340,210"
                  fill="#0f766e"
                />

                {/* laptop screen */}
                <g>
                  <polygon
                    points="130,170 200,150 270,170 200,190"
                    fill="#e2e8f0"
                  />
                  <polygon
                    points="135,168 200,151 200,180 135,196"
                    fill="#0f172a"
                  />
                  {/* bars chart on screen */}
                  <rect x="148" y="178" width="6" height="14" fill="#38bdf8" />
                  <rect x="157" y="172" width="6" height="20" fill="#38bdf8" />
                  <rect x="166" y="166" width="6" height="26" fill="#38bdf8" />
                  <rect x="175" y="160" width="6" height="32" fill="#38bdf8" />
                  {/* line chart accent */}
                  <polyline
                    points="148,168 160,158 172,162 184,150"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="1.5"
                  />
                  {/* pie chart */}
                  <circle cx="190" cy="160" r="9" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                  <path d="M190 160 L190 151 A9 9 0 0 1 198 165 Z" fill="#fb7185" />
                </g>

                {/* laptop base/keyboard */}
                <polygon
                  points="100,196 200,178 300,196 200,214"
                  fill="#f1f5f9"
                />
                <polygon
                  points="100,196 200,178 200,184 100,202"
                  fill="#cbd5e1"
                />
                <polygon
                  points="300,196 200,178 200,184 300,202"
                  fill="#94a3b8"
                />
                <ellipse cx="200" cy="196" rx="22" ry="6" fill="#e2e8f0" opacity="0.8" />

                {/* coffee mug */}
                <g>
                  <ellipse cx="270" cy="175" rx="12" ry="6" fill="#5eead4" />
                  <rect x="259" y="160" width="22" height="16" rx="3" fill="#2dd4bf" />
                  <ellipse cx="270" cy="160" rx="11" ry="4" fill="#0f766e" />
                  <path
                    d="M281 164 q8 2 6 9 q-2 5 -8 4"
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="2"
                  />
                  {/* steam */}
                  <path
                    d="M266 152 q-3 -6 1 -10"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                    opacity="0.7"
                  />
                  <path
                    d="M274 150 q3 -6 -1 -11"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="md:w-[54%] p-10 md:p-12 flex flex-col">
          <h2 className="text-3xl font-bold text-slate-900">Create an Account</h2>
          <p className="text-slate-500 mt-1.5 mb-8">
            Start your journey to interview mastery today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[#F2F4FD] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-[#F2F4FD] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F2F4FD] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F2F4FD] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-sm text-slate-600 pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {apiError && (
              <p className="text-sm text-red-500 text-center -mb-1">{apiError}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400 tracking-wide">
              OR CONTINUE WITH
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            disabled
            title="Google sign-in coming soon"
            className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-400 cursor-not-allowed opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Continue with Google (Coming Soon)
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-medium hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
