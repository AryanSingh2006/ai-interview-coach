"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  MessageSquare,
  BarChart3,
  BookOpen,
  Code2,
  Users,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Award,
  ChevronRight,
} from 'lucide-react';

// ─── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
        <Zap size={14} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="text-[15px] font-bold tracking-tight text-slate-900">InterviewPro</span>
    </div>
  );
}

// ─── Divider with label ────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-blue-600 uppercase">
      <span className="w-3 h-px bg-blue-400 inline-block" />
      {children}
      <span className="w-3 h-px bg-blue-400 inline-block" />
    </span>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ index, icon: Icon, title, description }) {
  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-blue-600" strokeWidth={2} />
        </div>
        {index < 3 && <div className="w-px flex-1 bg-slate-100 mt-3" />}
      </div>
      <div className="pb-8">
        <p className="text-[10px] font-bold text-blue-500 tracking-widest mb-1">STEP {String(index + 1).padStart(2, '0')}</p>
        <h4 className="text-sm font-semibold text-slate-800 mb-1.5">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, accent = false }) {
  return (
    <div className={`rounded-2xl p-6 border ${accent ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-5 ${accent ? 'bg-white/10' : 'bg-blue-50'}`}>
        <Icon size={16} className={accent ? 'text-blue-300' : 'text-blue-600'} strokeWidth={2} />
      </div>
      <h3 className={`text-sm font-semibold mb-2 ${accent ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const steps = [
    { icon: FileText,    title: 'Upload your resume',      description: 'We analyse your experience, skills, and achievements to build a candidate profile tailored to the role you are targeting.' },
    { icon: MessageSquare, title: 'Select interview type', description: 'Choose from technical, behavioural, system design, or HR rounds. Each mode adapts dynamically to your background.' },
    { icon: RefreshCw,   title: 'Complete the session',    description: 'Answer questions in a realistic simulation. Follow-up questions adapt in real time to your responses.' },
    { icon: BarChart3,   title: 'Review your feedback',    description: 'Receive a scored evaluation across multiple dimensions and a structured learning plan to close your gaps.' },
  ];

  const features = [
    { icon: FileText,  title: 'Resume Intelligence',    description: 'Parses your resume to surface relevant skills and experience, ensuring every question is specific to your background.' },
    { icon: Code2,     title: 'Technical Depth',        description: 'Covers algorithms, system design, and domain-specific engineering questions across 20+ technology stacks.' },
    { icon: Users,     title: 'Behavioural Coaching',   description: 'Structures your answers using the STAR framework, tracking narrative quality and professional tone.' },
    { icon: RefreshCw, title: 'Adaptive Follow-ups',    description: 'Questions evolve based on your answers. No two sessions are identical.' },
    { icon: BarChart3, title: 'Scored Evaluation',      description: 'Multi-dimensional scoring across communication, accuracy, structure, and confidence.' },
    { icon: BookOpen,  title: 'Learning Roadmap',       description: 'A curated, personalised plan of resources and exercises generated directly from your performance gaps.' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased">

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
          <button onClick={() => scrollTo('hero')} className="focus:outline-none">
            <LogoMark />
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features',    id: 'features' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Pricing',     id: 'pricing' },
              { label: 'About',       id: 'about' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Log in
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <CheckCircle size={11} strokeWidth={2.5} />
              No credit card required
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                Interview preparation<br />
                <span className="text-blue-600">done seriously.</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
                Upload your resume, run a tailored mock interview, and get actionable feedback — all in one structured workflow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
              >
                Start for free
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                See how it works
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Social proof inline */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="flex -space-x-1.5">
                {['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6'].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>Joined by <strong className="text-slate-600 font-semibold">50,000+</strong> professionals</span>
            </div>
          </div>

          {/* Right — workflow preview */}
          <div className="relative">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="flex-1 mx-3 h-5 bg-white border border-slate-200 rounded text-[10px] text-slate-400 flex items-center px-2.5">
                  interviewpro.app/interview
                </div>
              </div>

              {/* Mock session */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Technical Interview</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={11} />
                    12:34
                  </div>
                </div>

                {/* Question bubble */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 font-medium mb-1.5">Question 3 of 10</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Walk me through how you would design a rate-limiting system for a high-traffic REST API.
                  </p>
                </div>

                {/* Answer area */}
                <div className="border border-slate-200 rounded-xl px-4 py-3 min-h-[60px] bg-white">
                  <p className="text-sm text-slate-400 italic">Type your answer…</p>
                </div>

                {/* Action row */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <div key={n} className={`w-1.5 h-1.5 rounded-full ${n <= 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg">
                    Submit answer
                  </div>
                </div>
              </div>
            </div>

            {/* Floating score card */}
            <div className="absolute -bottom-4 -right-4 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Award size={15} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Score: 87%</p>
                <p className="text-[10px] text-slate-400">Strong performance</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <div className="border-y border-slate-100 bg-slate-50 py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-14 gap-y-3">
          <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">Used by candidates at</span>
          {['Google', 'Amazon', 'Meta', 'McKinsey', 'Goldman Sachs', 'Stripe'].map((name) => (
            <span key={name} className="text-sm font-semibold text-slate-400 tracking-wide">{name}</span>
          ))}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-5 lg:sticky lg:top-28">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Four steps from upload to offer.
            </h2>
            <p className="text-slate-500 leading-relaxed">
              A structured workflow that takes you from an uploaded resume to a comprehensive performance report and a learning plan — in a single session.
            </p>
            <button
              onClick={() => router.push('/signup')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm mt-2"
            >
              Try it now
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-0 pt-2">
            {steps.map((step, i) => (
              <StepCard key={i} index={i} icon={step.icon} title={step.title} description={step.description} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="max-w-xl space-y-4">
            <SectionLabel>Features</SectionLabel>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Everything you need to prepare properly.
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Purpose-built tools for every stage of the interview process — from initial analysis to post-session review.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FeatureCard
                key={i}
                icon={f.icon}
                title={f.title}
                description={f.description}
                accent={i === 5}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 divide-x divide-slate-100">
            {[
              { value: '50,000+', label: 'Sessions completed' },
              { value: '94%',     label: 'User satisfaction' },
              { value: '3×',      label: 'Faster preparation' },
              { value: '200+',    label: 'Companies covered' },
            ].map(({ value, label }) => (
              <div key={label} className="pl-6 first:pl-0">
                <StatCard value={value} label={label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Simple, transparent pricing.</h2>
            <p className="text-slate-500 leading-relaxed">
              We are finalising our pricing tiers. Early access is free — no credit card required.
            </p>
          </div>

          <div className="max-w-sm mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Clock size={11} strokeWidth={2.5} />
              Early Access
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900">Free</p>
              <p className="text-slate-400 text-sm mt-1">During early access period</p>
            </div>
            <ul className="space-y-3 text-left">
              {[
                'Unlimited mock interviews',
                'Resume-tailored questions',
                'Detailed performance report',
                'Personalised learning plan',
                'All interview types included',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle size={14} className="text-blue-600 shrink-0" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/signup')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors shadow-sm"
            >
              Get early access
            </button>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <SectionLabel>About</SectionLabel>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Built by engineers and hiring managers.
            </h2>
            <p className="text-slate-500 leading-relaxed">
              InterviewPro was built because of a simple observation: most candidates fail interviews not due to lack of skill, but lack of structured practice. Coaching that used to cost thousands is now available to everyone.
            </p>
            <p className="text-slate-500 leading-relaxed">
              We believe preparation should be rigorous, personalised, and honest — so you walk into every room knowing exactly where you stand.
            </p>
            <button
              onClick={() => router.push('/signup')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Start preparing
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            {[
              { icon: Shield,    title: 'Private by default',   body: 'Your resume and session data are never shared or used to train external models.' },
              { icon: TrendingUp, title: 'Progress tracking',   body: 'Session history and scoring trends visible across every interview you complete.' },
              { icon: Clock,     title: 'Flexible sessions',    body: 'Resume a session where you left off. No time pressure outside the session itself.' },
              { icon: Award,     title: 'Credible feedback',    body: 'Scored by evaluation models calibrated against real hiring criteria, not generic rubrics.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white p-6 space-y-3">
                <Icon size={16} className="text-blue-600" strokeWidth={2} />
                <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Ready to prepare properly?
          </h2>
          <p className="text-slate-500 leading-relaxed">
            Create a free account, upload your resume, and start your first session in under two minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => router.push('/signup')}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors shadow-sm"
            >
              Create free account
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <LogoMark />
          <p className="text-sm text-slate-400">© 2026 InterviewPro. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <span className="cursor-default">Privacy</span>
            <span className="cursor-default">Terms</span>
            <span className="cursor-default">Contact</span>
          </div>
        </div>
      </footer>

    </div>
  );
}