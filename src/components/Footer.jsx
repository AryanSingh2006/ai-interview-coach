import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-lg font-bold text-ink">
          Interview<span className="text-primary">Pro</span>
        </span>
        <nav className="flex items-center gap-6 text-sm text-gray-500">
          <span className="cursor-default opacity-60">Privacy Policy</span>
          <span className="cursor-default opacity-60">Terms</span>
          <span className="cursor-default opacity-60">Contact</span>
        </nav>
        <p className="text-sm text-gray-400">&copy; 2024 InterviewPro SaaS. All rights reserved.</p>
      </div>
    </footer>
  )
}
