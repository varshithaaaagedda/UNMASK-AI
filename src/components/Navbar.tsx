'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, User, CheckCircle2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Overview', href: '/' },
    { name: 'Scan', href: '/scan' },
    { name: 'History', href: '/history' },
    { name: 'Settings', href: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Shield className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                  UNMASK <span className="text-xs font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">AI</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Engine Status Indicator */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-600">Verification Engine Ready</span>
            </div>
            
            <div className="h-4 w-px bg-slate-200"></div>

            <button 
              type="button" 
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              title="Analyst Profile"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs border border-slate-300">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  active
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Engine Active
            </span>
            <span>v2.4 Enterprise</span>
          </div>
        </div>
      )}
    </header>
  );
};
