import React, { useState } from 'react';
import {
  Image,
  Smile,
  Video,
  X,
  Send,
  Loader2,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postService';

interface CreatePostCardProps {
  onPostCreated?: () => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  showToast?: (msg: string) => void;
}

const PRESET_IMAGES = [
  { label: 'Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80' },
  { label: 'City Night', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Coffee & Books', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Tech Space', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80' },
];

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  onPostCreated,
  isOpenModal = false,
  onCloseModal,
}) => {
  const { user, userProfile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(isOpenModal);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatar =
    userProfile?.photoURL ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`;

  const displayName = userProfile?.displayName || user?.displayName || 'Friend';

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);
    setError(null);

    try {
      await createPost(
        user.uid,
        displayName,
        avatar,
        content.trim(),
        mediaUrl.trim() || undefined
      );

      setContent('');
      setMediaUrl('');
      setShowImageInput(false);
      setIsExpanded(false);
      if (onCloseModal) onCloseModal();
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      console.error('Post creation error:', err);
      setError('Failed to share post. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 transition">
      {/* Collapsed top bar */}
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
          referrerPolicy="no-referrer"
        />
        <button
          onClick={() => setIsExpanded(true)}
          className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 text-slate-500 rounded-full text-sm font-normal cursor-pointer transition"
        >
          What's on your mind, {displayName.split(' ')[0]}?
        </button>
      </div>

      {/* Expanded Modal / Inline Form */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
            rows={3}
            className="w-full text-slate-800 text-sm sm:text-base placeholder-slate-400 border border-slate-200 focus:border-blue-500 rounded-xl p-3 focus:outline-hidden resize-none transition"
            autoFocus
          />

          {/* Optional Image URL Input Section */}
          {showImageInput && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-blue-600" />
                  Add Photo via Image URL
                </span>
                <button
                  onClick={() => {
                    setShowImageInput(false);
                    setMediaUrl('');
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 text-xs sm:text-sm rounded-lg focus:border-blue-500 focus:outline-hidden"
              />

              {/* Quick Image Presets */}
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500">Quick presets:</span>
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setMediaUrl(preset.url)}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 hover:bg-blue-100 hover:text-blue-700 text-slate-700 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Image Preview */}
              {mediaUrl && (
                <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-48">
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

          {/* Action Row */}
          <div className="flex items-center justify-between mt-3 pt-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`p-2 rounded-full hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                  showImageInput ? 'text-blue-600 bg-blue-50' : 'text-slate-600'
                }`}
                title="Add Image"
              >
                <Image className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' 😊')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                title="Add Feeling"
              >
                <Smile className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Feeling</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  if (onCloseModal) onCloseModal();
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading || !content.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom shortcut buttons if not expanded */}
      {!isExpanded && (
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-slate-100 text-slate-600 text-xs sm:text-sm font-medium">
          <button
            onClick={() => {
              setIsExpanded(true);
              setShowImageInput(true);
            }}
            className="flex items-center justify-center gap-2 flex-1 py-1.5 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            <Image className="w-5 h-5 text-emerald-500" />
            <span>Photo / Media</span>
          </button>
          <button
            onClick={() => {
              setIsExpanded(true);
            }}
            className="flex items-center justify-center gap-2 flex-1 py-1.5 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            <Smile className="w-5 h-5 text-amber-500" />
            <span>Feeling / Activity</span>
          </button>
        </div>
      )}
    </div>
  );
};
