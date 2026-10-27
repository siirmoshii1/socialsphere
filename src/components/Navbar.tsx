import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Home,
  Users,
  User,
  PlusSquare,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Bell,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'feed' | 'friends' | 'profile';
  setCurrentTab: (tab: 'feed' | 'friends' | 'profile') => void;
  openCreatePostModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openCreatePostModal,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, userProfile, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatar =
    userProfile?.photoURL ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`;

  const displayName = userProfile?.displayName || user?.displayName || 'User';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand & Search */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('feed')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-sm group-hover:bg-blue-700 transition">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-blue-600 hidden sm:inline">
              Social<span className="text-slate-800">Sphere</span>
            </span>
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search SocialSphere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-100 hover:bg-slate-200/80 focus:bg-white text-sm rounded-full w-48 lg:w-64 border border-transparent focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center justify-center h-full gap-1 sm:gap-2 max-w-md w-full">
          <button
            onClick={() => setCurrentTab('feed')}
            className={`flex items-center justify-center flex-1 h-full border-b-[3px] transition cursor-pointer ${
              currentTab === 'feed'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg my-1'
            }`}
            title="Home Feed"
          >
            <Home className="w-6 h-6" />
          </button>

          <button
            onClick={() => setCurrentTab('friends')}
            className={`flex items-center justify-center flex-1 h-full border-b-[3px] transition cursor-pointer ${
              currentTab === 'friends'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg my-1'
            }`}
            title="Friends & Connections"
          >
            <Users className="w-6 h-6" />
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex items-center justify-center flex-1 h-full border-b-[3px] transition cursor-pointer ${
              currentTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg my-1'
            }`}
            title="My Profile"
          >
            <User className="w-6 h-6" />
          </button>
        </nav>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openCreatePostModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm rounded-full transition cursor-pointer"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Create</span>
          </button>

          {/* Social Quick Icons */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => alert('Notifications: All up to date!')}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert('Messenger: Direct chat feature preview')}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
              title="Messages"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <img
                src={avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                referrerPolicy="no-referrer"
              />
              <span className="font-semibold text-xs sm:text-sm text-slate-800 max-w-[90px] truncate hidden sm:inline">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div
                  onClick={() => {
                    setCurrentTab('profile');
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                >
                  <img
                    src={avatar}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm truncate">{displayName}</p>
                    <p className="text-xs text-blue-600">View your profile</p>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('friends');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Manage Friends</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search input */}
      <div className="md:hidden px-4 pb-2 pt-1 border-t border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search posts or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 text-sm rounded-full border border-transparent focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>
    </header>
  );
};
