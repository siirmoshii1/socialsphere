import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { StoryReel } from './components/StoryReel';
import { CreatePostCard } from './components/CreatePostCard';
import { PostCard } from './components/PostCard';
import { ProfileView } from './components/ProfileView';
import { FriendsView } from './components/FriendsView';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Post, FriendConnection } from './types';
import { subscribeToPosts, createPost } from './services/postService';
import { subscribeToFriends } from './services/friendService';
import {
  MessageSquare,
  Sparkles,
  Home,
  Users,
  User,
  PlusSquare,
  RefreshCw,
  Loader2,
  TrendingUp,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  const [currentTab, setCurrentTab] = useState<'feed' | 'friends' | 'profile'>('feed');
  const [postFilter, setPostFilter] = useState<'all' | 'mine' | 'photos'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Subscribe to real-time posts feed
  useEffect(() => {
    if (!user) return;
    setPostsLoading(true);
    const unsubscribe = subscribeToPosts(
      (newPosts) => {
        setPosts(newPosts);
        setPostsLoading(false);
      },
      (err) => {
        console.error('Feed subscription error:', err);
        setPostsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Subscribe to real-time friends list
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToFriends(user.uid, (loadedFriends) => {
      setFriends(loadedFriends);
    });
    return () => unsubscribe();
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Seed sample starter posts if database is fresh
  const handleSeedSamplePosts = async () => {
    if (!user || seedingLoading) return;
    setSeedingLoading(true);
    try {
      const authorName = userProfile?.displayName || user.displayName || 'SocialSphere Explorer';
      const authorPic = userProfile?.photoURL || user.photoURL || undefined;

      await createPost(
        user.uid,
        authorName,
        authorPic,
        'Welcome everyone to SocialSphere! 🚀 Built with React, Tailwind CSS, Firebase Authentication, and Cloud Firestore. Feel free to like, comment, and connect!',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80'
      );

      await createPost(
        user.uid,
        authorName,
        authorPic,
        'Weekend sunset photography hike in the hills. The golden hour lighting was absolutely breathtaking today 🌅✨ What is everyone working on this week?',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80'
      );

      showToast('Sample community posts created!');
    } catch (err) {
      console.error(err);
      showToast('Error seeding posts');
    } finally {
      setSeedingLoading(false);
    }
  };

  // Filter posts according to active filters & search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tab/Category filter
      if (postFilter === 'mine' && post.authorId !== user?.uid) return false;
      if (postFilter === 'photos' && !post.mediaUrl) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesContent = post.content.toLowerCase().includes(q);
        const matchesAuthor = post.authorName.toLowerCase().includes(q);
        return matchesContent || matchesAuthor;
      }
      return true;
    });
  }, [posts, postFilter, searchQuery, user]);

  const myPosts = useMemo(() => {
    return posts.filter((p) => p.authorId === user?.uid);
  }, [posts, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-lg animate-pulse">
          S
        </div>
        <p className="text-slate-500 font-semibold text-sm">Loading SocialSphere...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openCreatePostModal={() => setCreateModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-4 flex gap-6 justify-center">
        {/* Left Sidebar (Desktop) */}
        {currentTab === 'feed' && (
          <LeftSidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            postFilter={postFilter}
            setPostFilter={setPostFilter}
            friendsCount={friends.length}
            postsCount={myPosts.length}
          />
        )}

        {/* Center Main Content */}
        <main className="flex-1 max-w-2xl w-full">
          {currentTab === 'feed' && (
            <div className="space-y-4 pb-16">
              {/* Stories Bar */}
              <StoryReel />

              {/* Create Post Composer */}
              <CreatePostCard
                onPostCreated={() => showToast('Post shared to news feed!')}
              />

              {/* Feed Filter Pill Bar */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setPostFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                      postFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Posts
                  </button>
                  <button
                    onClick={() => setPostFilter('mine')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                      postFilter === 'mine'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    My Posts ({myPosts.length})
                  </button>
                  <button
                    onClick={() => setPostFilter('photos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                      postFilter === 'photos'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Photos Only
                  </button>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-blue-600 hover:underline shrink-0"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Feed Posts List */}
              {postsLoading ? (
                <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Loading news feed...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-10 text-center space-y-4">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">No posts found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery
                        ? `No posts matched "${searchQuery}". Try a different keyword.`
                        : 'Be the first to share a post with the SocialSphere community!'}
                    </p>
                  </div>

                  {!searchQuery && (
                    <button
                      onClick={handleSeedSamplePosts}
                      disabled={seedingLoading}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      {seedingLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>Load Sample Community Posts</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    showToast={showToast}
                    onPostUpdated={() => showToast('Post saved')}
                    onPostDeleted={() => showToast('Post deleted')}
                  />
                ))
              )}
            </div>
          )}

          {/* Friends View Tab */}
          {currentTab === 'friends' && (
            <FriendsView friends={friends} showToast={showToast} />
          )}

          {/* Profile View Tab */}
          {currentTab === 'profile' && (
            <ProfileView
              userPosts={myPosts}
              friends={friends}
              showToast={showToast}
              onPostUpdated={() => showToast('Post saved')}
              onPostDeleted={() => showToast('Post deleted')}
            />
          )}
        </main>

        {/* Right Sidebar (Desktop) */}
        {currentTab === 'feed' && (
          <RightSidebar
            friends={friends}
            onOpenProfile={(uid) => {
              setCurrentTab('profile');
            }}
            showToast={showToast}
          />
        )}
      </div>

      {/* Floating Create Post Modal (when triggered from navbar) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full">
            <CreatePostCard
              isOpenModal={true}
              onCloseModal={() => setCreateModalOpen(false)}
              onPostCreated={() => {
                setCreateModalOpen(false);
                showToast('Post shared to news feed!');
              }}
            />
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 h-14 flex items-center justify-around px-2 shadow-lg">
        <button
          onClick={() => setCurrentTab('feed')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            currentTab === 'feed' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Feed</span>
        </button>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-blue-600 cursor-pointer"
        >
          <PlusSquare className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] mt-0.5">Create</span>
        </button>

        <button
          onClick={() => setCurrentTab('friends')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            currentTab === 'friends' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Friends</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            currentTab === 'profile' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
