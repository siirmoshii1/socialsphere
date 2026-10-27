import React, { useState } from 'react';
import {
  Camera,
  Edit3,
  Calendar,
  Users,
  Grid,
  Heart,
  MessageSquare,
  Sparkles,
  Check,
  X,
  Loader2,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post, FriendConnection } from '../types';
import { PostCard } from './PostCard';
import { CreatePostCard } from './CreatePostCard';
import { formatRelativeTime } from '../utils/date';

interface ProfileViewProps {
  userPosts: Post[];
  friends: FriendConnection[];
  showToast?: (msg: string) => void;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  userPosts,
  friends,
  showToast,
  onPostUpdated,
  onPostDeleted,
}) => {
  const { user, userProfile, updateUserProfileData } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'about'>('posts');
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(userProfile?.displayName || user?.displayName || '');
  const [editBio, setEditBio] = useState(userProfile?.bio || '');
  const [editPhoto, setEditPhoto] = useState(userProfile?.photoURL || user?.photoURL || '');
  const [loading, setLoading] = useState(false);

  const avatar =
    userProfile?.photoURL ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`;

  const displayName = userProfile?.displayName || user?.displayName || 'User';

  const totalLikesReceived = userPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0);

  const handleOpenEdit = () => {
    setEditName(userProfile?.displayName || user?.displayName || '');
    setEditBio(userProfile?.bio || '');
    setEditPhoto(userProfile?.photoURL || user?.photoURL || '');
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setLoading(true);
    try {
      await updateUserProfileData({
        displayName: editName.trim(),
        bio: editBio.trim(),
        photoURL: editPhoto.trim() || undefined,
      });
      setEditModalOpen(false);
      if (showToast) showToast('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      if (showToast) showToast('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Profile Cover & Header Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-44 sm:h-64 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={avatar}
                alt={displayName}
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white shadow-lg bg-white"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={handleOpenEdit}
                className="absolute bottom-1 right-1 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition shadow-md cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{displayName}</h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl leading-relaxed">
              {userProfile?.bio || 'Hey there! I am using SocialSphere.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Joined {formatRelativeTime(userProfile?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">{friends.length}</span> friends
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="font-semibold text-slate-700">{totalLikesReceived}</span> likes received
              </div>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'posts'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Timeline ({userPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              About
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left info box */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Intro</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {userProfile?.bio || 'Add a bio to introduce yourself to friends.'}
              </p>
              <button
                onClick={handleOpenEdit}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Edit Bio
              </button>
            </div>

            {/* Friends preview box */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Friends</h3>
                  <span className="text-xs text-slate-400">{friends.length} connections</span>
                </div>
                <button
                  onClick={() => setActiveTab('friends')}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  See all
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {friends.slice(0, 6).map((f) => (
                  <div key={f.id} className="text-center group cursor-pointer">
                    <img
                      src={f.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.friendId}`}
                      alt={f.displayName}
                      className="w-full aspect-square rounded-lg object-cover ring-1 ring-slate-200 group-hover:scale-105 transition"
                    />
                    <p className="text-[11px] font-medium text-slate-700 truncate mt-1">
                      {f.displayName.split(' ')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right posts stream */}
          <div className="md:col-span-2 space-y-4">
            <CreatePostCard showToast={showToast} onPostCreated={onPostUpdated} />

            {userPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No Posts Yet</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Share your first thought or photo with the community!
                </p>
              </div>
            ) : (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={onPostUpdated}
                  onPostDeleted={onPostDeleted}
                  showToast={showToast}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">All Friends ({friends.length})</h3>
          {friends.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">
              No friends in your list yet. Visit the Friends tab to find people to connect with!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:shadow-xs transition"
                >
                  <img
                    src={friend.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.friendId}`}
                    alt={friend.displayName}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {friend.displayName}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                      <UserCheck className="w-3 h-3" />
                      Connected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">About Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-400">Account Email</p>
                <p className="font-semibold text-slate-800">{user?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-400">Member Since</p>
                <p className="font-semibold text-slate-800">{formatRelativeTime(userProfile?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={80}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-sm rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Status
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-sm rounded-xl focus:border-blue-500 focus:outline-hidden resize-none"
                  placeholder="Tell friends about yourself..."
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                  maxLength={1000}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-sm rounded-xl focus:border-blue-500 focus:outline-hidden"
                  placeholder="https://example.com/avatar.jpg"
                />

                {/* Preset Avatars */}
                <div className="mt-2.5">
                  <span className="text-[11px] text-slate-500 block mb-1.5">
                    Or select a sample avatar:
                  </span>
                  <div className="flex items-center gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        onClick={() => setEditPhoto(preset)}
                        className={`w-9 h-9 rounded-full object-cover cursor-pointer ring-2 transition ${
                          editPhoto === preset ? 'ring-blue-600 scale-105' : 'ring-transparent hover:ring-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !editName.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
