import React from 'react'
import { Search, Bell, HelpCircle, Menu } from 'lucide-react'

export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-4 px-4 sm:px-8 py-4">
        <button className="lg:hidden p-2 -ml-2 text-ink" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <Bell size={18} />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <HelpCircle size={18} />
          </button>
          <img
            src="https://i.pravatar.cc/64?img=12"
            alt="Profile avatar"
            className="w-9 h-9 rounded-full object-cover border border-border"
          />
        </div>
      </div>
    </header>
  )
}
