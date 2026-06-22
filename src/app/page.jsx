"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// REUSABLE SUB-COMPONENTS
// ============================================================================

function FeatureBadgeRow() {
  const partners = ["EDUCORE", "TALENTFLOW", "RECRUITLY", "ELITEPRO"];
  return (
    <div className="w-full bg-slate-50/60 border-y border-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col space-y-4 items-center justify-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Trusted by students, job seekers, professionals, and recruiters
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 pt-1">
          {partners.map((partner, i) => (
            <div key={i} className="flex items-center space-x-2 opacity-40 hover:opacity-70 transition-opacity cursor-default">
              <div className="w-3.5 h-3.5 bg-slate-800 rounded-sm transform rotate-45 flex-shrink-0"></div>
              <span className="text-sm font-black tracking-wider text-slate-800">{partner}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepCard({ stepNumber, title, description }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div className="space-y-4">
        <span className="text-3xl font-black text-blue-600/15 tracking-tight block font-mono">
          {stepNumber}
        </span>
        <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">{title}</h4>
        <p className="text-xs text-slate-400 font-normal leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LANDING PAGE
// ============================================================================
export default function LandingPage() {
  const router = useRouter();

  const steps = [
    { num: "01", title: "Upload Resume", desc: "Our AI analyzes your professional history to tailor specific questions to your background." },
    { num: "02", title: "Choose Type", desc: "Select from technical, behavioral, or executive interview formats for your target role." },
    { num: "03", title: "Complete Mock", desc: "Engage in a live-session simulation with dynamic follow-ups and realistic scenarios." },
    { num: "04", title: "Get Feedback", desc: "Receive an instant evaluation and a structured learning plan to address your weaknesses." }
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-blue-100">
      
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/60 transition-all">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-black text-xs">I</span>
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">InterviewPro</span>
          </div>

          {/* Navigation Links — smooth scroll */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-500 tracking-wide">
            <button onClick={() => scrollTo('features')} className="hover:text-blue-600 transition">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-blue-600 transition">How It Works</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-blue-600 transition">Pricing</button>
            <button onClick={() => scrollTo('about')} className="hover:text-blue-600 transition">About</button>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition px-3 py-2"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition transform active:scale-[0.98]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero */}
      <section id="hero" className="relative pt-12 pb-20 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              Practice Interviews. <br />
              <span className="text-blue-600">Improve Every Attempt.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Upload your resume, generate realistic mock interviews, receive detailed feedback, and follow a personalized learning roadmap.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={() => router.push('/signup')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-7 py-4 rounded-xl shadow-lg shadow-blue-500/20 transition transform active:scale-[0.97] uppercase tracking-wide"
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-3">
          {[
            { label: "Resume Upload", sub: "AI parses your skills", icon: "📄" },
            { label: "Interview Session", sub: "Realistic voice mock", icon: "💬" },
            { label: "Feedback", sub: "Detailed scores & tips", icon: "📊" },
            { label: "Learning Plan", sub: "Personalized roadmap", icon: "🗺️" }
          ].map((card, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center space-x-4 transition-all duration-200 hover:shadow-md hover:translate-x-1 cursor-default">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shadow-inner">
                {card.icon}
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">{card.label}</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Social Proof */}
      <FeatureBadgeRow />

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-20 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Seamless from Start to Finish
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            Our four-step process is designed to replicate the pressure of a real interview while providing the safety of a training ground.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <StepCard key={index} stepNumber={step.num} title={step.title} description={step.desc} />
          ))}
        </div>
      </section>

      {/* 5. Features Bento */}
      <section id="features" className="py-20 bg-slate-50/50 border-t border-slate-100 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100 font-bold tracking-wider uppercase inline-block">
                Powerful Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Precision Tools for Career Success
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm mb-3">📄</div>
                <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Resume Analysis</h3>
                <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-md">
                  Advanced NLP engine that dissects your resume to identify key skills, achievements, and potential gaps for specific job descriptions.
                </p>
              </div>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 shadow-inner">
                <div className="w-1/3 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full"></div>
                <div className="w-5/6 h-1.5 bg-slate-200 rounded-full"></div>
                <div className="w-4/5 h-1.5 bg-slate-200 rounded-full"></div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-blue-600 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
              <div className="text-sm font-bold font-mono text-blue-200/80 tracking-widest">&lt;/&gt;</div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-base font-extrabold tracking-tight">Technical Interviews</h3>
                <p className="text-xs text-blue-100 font-normal leading-relaxed">
                  Deep-dive simulations for coding, system design, and algorithmic problem-solving across 20+ technologies.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="text-sm">💡</div>
              <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">Behavioral Interviews</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                Master the STAR method with AI coaching that tracks your storytelling structure and confidence levels.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="text-sm">🔄</div>
              <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">Dynamic Follow-ups</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                Our AI listens and responds. No generic scripts—questions evolve based on your specific answers.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="text-sm">📈</div>
              <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">Detailed Evaluation</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                Comprehensive metrics on communication, technical accuracy, tone, and professional impact.
              </p>
            </div>

            <div className="lg:col-span-12 bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-lg">
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <h3 className="text-sm font-extrabold tracking-tight">Personalized Learning Plans</h3>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  A dynamic roadmap that automatically populates with curated resources, practice exercises, and targeted reading based on your interview performance.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => router.push('/signup')}
                    className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] px-4 py-2.5 rounded-xl transition shadow-sm"
                  >
                    Explore Roadmaps
                  </button>
                </div>
              </div>
              <div className="w-full md:w-64 h-32 bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <span className="text-2xl opacity-20 filter grayscale">🗺️</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Pricing — Coming Soon */}
      <section id="pricing" className="py-20 px-4 border-t border-slate-100">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100 font-bold tracking-wider uppercase inline-block">
            Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            We&apos;re finalising our pricing tiers. Sign up now to get early access and be the first to know when plans launch.
          </p>
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-8 py-6 shadow-sm">
            <span className="text-2xl">🚀</span>
            <div className="text-left">
              <p className="text-sm font-extrabold text-slate-800">Coming Soon</p>
              <p className="text-xs text-slate-400 mt-0.5">Early access is free. No credit card required.</p>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </section>

      {/* 7. About */}
      <section id="about" className="py-20 px-4 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100 font-bold tracking-wider uppercase inline-block">
              About
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Built for the Modern Job Seeker
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              InterviewPro was created by engineers and hiring managers who experienced first-hand how unprepared most candidates are — not due to lack of ability, but lack of practice.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Our AI-powered platform gives every candidate access to the same level of preparation that was previously only available through expensive coaching.
            </p>
            <button
              onClick={() => router.push('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition"
            >
              Start Preparing Today
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "50,000+", label: "Interviews Conducted" },
              { stat: "94%", label: "User Satisfaction Rate" },
              { stat: "3x", label: "Faster Interview Prep" },
              { stat: "200+", label: "Companies Represented" },
            ].map(({ stat, label }) => (
              <div key={label} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center">
                <p className="text-2xl font-black text-blue-600">{stat}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center px-6 py-12 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent)]"></div>
          <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Join 50,000+ professionals who have used InterviewPro to land their dream jobs at top-tier companies.
            </p>
          </div>
          <div className="pt-2 relative z-10">
            <button
              onClick={() => router.push('/signup')}
              className="bg-white hover:bg-slate-50 text-blue-600 font-black text-xs px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-[0.98] tracking-wide"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 px-4 text-xs font-semibold text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-slate-800 font-bold text-sm">InterviewPro</p>
            <p className="text-[10px] font-medium text-slate-400">Building the future of recruitment intelligence and interview preparation.</p>
            <p className="text-[10px] font-normal text-slate-400/80 pt-2">&copy; 2026 InterviewPro SaaS. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-6 text-[11px] font-bold text-slate-400 tracking-wide">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
          </div>
        </div>
      </footer>

    </div>
  );
}