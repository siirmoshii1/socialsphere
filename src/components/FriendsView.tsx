import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { FriendConnection, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { addFriend, removeFriend, fetchSuggestedUsers } from '../services/friendService';

interface FriendsViewProps {
  friends: FriendConnection[];
  showToast?: (msg: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ friends, showToast }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'connected' | 'discover'>('connected');
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchSuggestedUsers(user.uid)
      .then((users) => {
        setAllUsers(users);
      })
      .finally(() => setLoading(false));
  }, [user, friends]);

  const friendIds = new Set(friends.map((f) => f.friendId));

  const filteredFriends = friends.filter((f) =>
    f.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const discoverableUsers = allUsers.filter(
    (u) =>
      !friendIds.has(u.uid) &&
      u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (target: UserProfile) => {
    if (!user) return;
    setActionId(target.uid);
    try {
      await addFriend(user.uid, {
        uid: target.uid,
        displayName: target.displayName,
        photoURL: target.photoURL,
      });
      if (showToast) showToast(`Added ${target.displayName} to friends!`);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to add friend');
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (friendId: string, name: string) => {
    if (!user) return;
    if (!window.confirm(`Remove ${name} from your friends?`)) return;

    setActionId(friendId);
    try {
      await removeFriend(user.uid, friendId);
      if (showToast) showToast(`Removed ${name} from friends`);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to remove friend');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Friends &amp; Connections</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build your network on SocialSphere. Manage your circle or connect with other members.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('connected')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'connected'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'discover'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Find Friends ({discoverableUsers.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            activeTab === 'connected'
              ? 'Search through your friends...'
              : 'Search people to add...'
          }
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-sm rounded-xl focus:border-blue-500 focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Grid of Friends / Discover */}
      {activeTab === 'connected' ? (
        filteredFriends.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Friends Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {friends.length === 0
                ? 'You have not added any friends yet.'
                : 'No friends matched your search filter.'}
            </p>
            <button
              onClick={() => setActiveTab('discover')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Discover People
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFriends.map((friend) => {
              const avatar =
                friend.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.friendId}`;
              const isRemoving = actionId === friend.friendId;

              return (
                <div
                  key={friend.id}
                  className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col justify-between hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt={friend.displayName}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {friend.displayName}
                      </h4>
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3 h-3" />
                        Connected
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Friend</span>
                    <button
                      onClick={() => handleRemove(friend.friendId, friend.displayName)}
                      disabled={isRemoving}
                      className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      title="Remove Friend"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Discover Tab */
        discoverableUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-12 text-center">
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">All Caught Up!</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are already connected with all currently discovered members on SocialSphere.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {discoverableUsers.map((candidate) => {
              const avatar =
                candidate.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.uid}`;
              const isAdding = actionId === candidate.uid;

              return (
                <div
                  key={candidate.uid}
                  className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col justify-between hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt={candidate.displayName}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {candidate.displayName}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {candidate.bio || 'SocialSphere Member'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleAdd(candidate)}
                      disabled={isAdding}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isAdding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      <span>Add Friend</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
