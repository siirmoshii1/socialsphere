import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Check,
  Search,
  Gift,
  Circle,
  Sparkles,
} from 'lucide-react';
import { FriendConnection, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { addFriend, removeFriend, fetchSuggestedUsers } from '../services/friendService';

interface RightSidebarProps {
  friends: FriendConnection[];
  onOpenProfile?: (userId: string) => void;
  showToast?: (msg: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  friends,
  onOpenProfile,
  showToast,
}) => {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchSuggestedUsers(user.uid).then((users) => {
      // Filter out those who are already friends
      const friendIds = new Set(friends.map((f) => f.friendId));
      setSuggestedUsers(users.filter((u) => !friendIds.has(u.uid)));
    });
  }, [user, friends]);

  const handleAddFriend = async (suggested: UserProfile) => {
    if (!user) return;
    setAddingId(suggested.uid);
    try {
      await addFriend(user.uid, {
        uid: suggested.uid,
        displayName: suggested.displayName,
        photoURL: suggested.photoURL,
      });
      if (showToast) showToast(`Added ${suggested.displayName} as friend!`);
    } catch (err) {
      console.error('Add friend error:', err);
      if (showToast) showToast('Failed to add friend');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <aside className="w-72 shrink-0 hidden xl:block space-y-4">
      {/* Birthdays / Events Notice */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">Community News</p>
          <p className="text-[11px] text-slate-500">Welcome to SocialSphere! Connect with friends.</p>
        </div>
      </div>

      {/* Suggested People to Connect */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Suggested Friends
          </h4>
          <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
            See all
          </span>
        </div>

        <div className="space-y-3">
          {suggestedUsers.length === 0 ? (
            <p className="text-xs text-slate-400 py-1">
              You are connected with all nearby members!
            </p>
          ) : (
            suggestedUsers.slice(0, 4).map((suggested) => {
              const avatar =
                suggested.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${suggested.uid}`;
              const isAdding = addingId === suggested.uid;

              return (
                <div key={suggested.uid} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={avatar}
                      alt={suggested.displayName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {suggested.displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {suggested.bio || 'SocialSphere Member'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddFriend(suggested)}
                    disabled={isAdding}
                    className="shrink-0 px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    title="Add Friend"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Friends & Active Contacts */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Friends ({friends.length})</span>
          </h4>
        </div>

        <div className="space-y-2">
          {friends.length === 0 ? (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs text-slate-500">No friends added yet.</p>
              <p className="text-[11px] text-slate-400">Add people from the suggestions above!</p>
            </div>
          ) : (
            friends.map((friend) => {
              const avatar =
                friend.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.friendId}`;

              return (
                <div
                  key={friend.id}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={friend.displayName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    {/* Active Green Dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition truncate">
                      {friend.displayName}
                    </p>
                    <p className="text-[10px] text-emerald-600">Active now</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
