import React from 'react';
import {
  Home,
  Users,
  User,
  Image,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Flame,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/date';

interface LeftSidebarProps {
  currentTab: 'feed' | 'friends' | 'profile';
  setCurrentTab: (tab: 'feed' | 'friends' | 'profile') => void;
  postFilter: 'all' | 'mine' | 'photos';
  setPostFilter: (filter: 'all' | 'mine' | 'photos') => void;
  friendsCount: number;
  postsCount: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentTab,
  setCurrentTab,
  postFilter,
  setPostFilter,
  friendsCount,
  postsCount,
}) => {
  const { user, userProfile } = useAuth();

  const avatar =
    userProfile?.photoURL ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`;

  const displayName = userProfile?.displayName || user?.displayName || 'User';

  return (
    <aside className="w-64 shrink-0 hidden lg:block space-y-4">
      {/* Profile summary card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div
          onClick={() => setCurrentTab('profile')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={avatar}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500 transition"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition truncate">
              {displayName}
            </h4>
            <p className="text-xs text-slate-500 truncate">{userProfile?.bio || 'Active member'}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div
            onClick={() => {
              setCurrentTab('feed');
              setPostFilter('mine');
            }}
            className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition"
          >
            <p className="font-bold text-base text-slate-900">{postsCount}</p>
            <p className="text-[11px] text-slate-500">Posts</p>
          </div>
          <div
            onClick={() => setCurrentTab('friends')}
            className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition"
          >
            <p className="font-bold text-base text-slate-900">{friendsCount}</p>
            <p className="text-[11px] text-slate-500">Friends</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 space-y-0.5">
        <button
          onClick={() => {
            setCurrentTab('feed');
            setPostFilter('all');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            currentTab === 'feed' && postFilter === 'all'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Home className="w-5 h-5 text-blue-600" />
          <span>News Feed</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('feed');
            setPostFilter('mine');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            currentTab === 'feed' && postFilter === 'mine'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <User className="w-5 h-5 text-indigo-500" />
          <span>My Posts</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('feed');
            setPostFilter('photos');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            currentTab === 'feed' && postFilter === 'photos'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Image className="w-5 h-5 text-emerald-500" />
          <span>Photos & Media</span>
        </button>

        <button
          onClick={() => setCurrentTab('friends')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            currentTab === 'friends'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-5 h-5 text-blue-500" />
          <span>Friends & Circles</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            currentTab === 'profile'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-5 h-5 text-amber-500" />
          <span>Profile Page</span>
        </button>
      </div>

      {/* Cloud Firestore & Live Status Badge */}
      <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-bold tracking-wide uppercase">Firebase Verified</span>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          Cloud Firestore live sync enabled with ABAC security rules and active session protection.
        </p>
      </div>
    </aside>
  );
};
