import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Story {
  id: string;
  authorName: string;
  avatar: string;
  imageUrl: string;
  time: string;
}

const SAMPLE_STORIES: Story[] = [
  {
    id: 's1',
    authorName: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    time: '2h ago',
  },
  {
    id: 's2',
    authorName: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
    time: '4h ago',
  },
  {
    id: 's3',
    authorName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
    time: '5h ago',
  },
  {
    id: 's4',
    authorName: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    time: '7h ago',
  },
];

export const StoryReel: React.FC = () => {
  const { userProfile, user } = useAuth();
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const myAvatar =
    userProfile?.photoURL ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`;

  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1">
        {/* Create Story Card */}
        <div
          onClick={() =>
            setActiveStory({
              id: 'my-story',
              authorName: userProfile?.displayName || 'My Story',
              avatar: myAvatar,
              imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
              time: 'Just now',
            })
          }
          className="relative shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-xl overflow-hidden shadow-xs cursor-pointer group bg-white border border-slate-200 hover:shadow-md transition flex flex-col"
        >
          <div className="h-32 sm:h-36 overflow-hidden">
            <img
              src={myAvatar}
              alt="You"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
          <div className="relative flex-1 bg-white flex flex-col items-center justify-center pt-2 pb-1.5">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white shadow-sm group-hover:bg-blue-700 transition">
              <Plus className="w-5 h-5 font-bold" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 mt-1">Create Story</span>
          </div>
        </div>

        {/* Stories list */}
        {SAMPLE_STORIES.map((story) => (
          <div
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="relative shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-xl overflow-hidden shadow-xs cursor-pointer group border border-slate-200 hover:shadow-md transition"
          >
            <img
              src={story.imageUrl}
              alt={story.authorName}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/70" />

            {/* Author Avatar with Ring */}
            <div className="absolute top-2.5 left-2.5">
              <img
                src={story.avatar}
                alt={story.authorName}
                className="w-9 h-9 rounded-full object-cover ring-3 ring-blue-500 shadow-md"
              />
            </div>

            {/* Author Name */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <p className="text-white text-xs font-semibold drop-shadow-md truncate">
                {story.authorName}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setActiveStory(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-sm w-full h-[540px] rounded-2xl overflow-hidden shadow-2xl bg-black flex flex-col justify-between">
            <img
              src={activeStory.imageUrl}
              alt={activeStory.authorName}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/60" />

            {/* Top Bar */}
            <div className="relative z-10 p-4 flex items-center gap-3">
              <img
                src={activeStory.avatar}
                alt={activeStory.authorName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
              />
              <div>
                <p className="text-white text-sm font-semibold">{activeStory.authorName}</p>
                <p className="text-slate-300 text-xs">{activeStory.time}</p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 p-4">
              <p className="text-white text-sm bg-black/40 backdrop-blur-xs px-3 py-2 rounded-lg">
                Viewing story from {activeStory.authorName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
