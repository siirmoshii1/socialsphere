import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
  X,
  Send,
  Loader2,
  Heart,
  Globe,
  CornerDownRight,
} from 'lucide-react';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  toggleLikePost,
  subscribeToUserLike,
  subscribeToComments,
  addComment,
  deleteComment,
  deletePost,
  updatePost,
} from '../services/postService';
import { formatRelativeTime } from '../utils/date';

interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
  showToast?: (msg: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostUpdated,
  onPostDeleted,
  showToast,
}) => {
  const { user, userProfile } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Edit post state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editMediaUrl, setEditMediaUrl] = useState(post.mediaUrl || '');
  const [editLoading, setEditLoading] = useState(false);

  // Actions menu dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const isAuthor = user?.uid === post.authorId;

  // Sync like count when prop updates
  useEffect(() => {
    setLikeCount(post.likesCount || 0);
  }, [post.likesCount]);

  // Real-time listener for current user's like state
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserLike(post.id, user.uid, (liked) => {
      setIsLiked(liked);
    });
    return () => unsubscribe();
  }, [post.id, user]);

  // Real-time listener for comments when comments section is opened
  useEffect(() => {
    if (!showComments) return;
    const unsubscribe = subscribeToComments(post.id, (loadedComments) => {
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, [post.id, showComments]);

  // Handle Like toggle with optimistic UI
  const handleToggleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);

    const prevLiked = isLiked;
    const prevCount = likeCount;

    // Optimistic update
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await toggleLikePost(post.id, user.uid, prevLiked);
    } catch (err) {
      console.error('Like toggle error:', err);
      // Revert on error
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user || commentLoading) return;

    setCommentLoading(true);
    try {
      const commenterName = userProfile?.displayName || user.displayName || 'Friend';
      const commenterPic = userProfile?.photoURL || user.photoURL || undefined;

      await addComment(post.id, user.uid, commenterName, commenterPic, newCommentText.trim());
      setNewCommentText('');
    } catch (err) {
      console.error('Comment error:', err);
      if (showToast) showToast('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(post.id, commentId);
      if (showToast) showToast('Comment deleted');
    } catch (err) {
      console.error('Delete comment error:', err);
      if (showToast) showToast('Could not delete comment');
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      await updatePost(post.id, editContent.trim(), editMediaUrl.trim() || undefined);
      setIsEditing(false);
      setMenuOpen(false);
      if (showToast) showToast('Post updated successfully');
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      console.error('Update post error:', err);
      if (showToast) showToast('Failed to update post');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post.id);
      if (showToast) showToast('Post deleted');
      if (onPostDeleted) onPostDeleted();
    } catch (err) {
      console.error('Delete post error:', err);
      if (showToast) showToast('Could not delete post');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    if (showToast) showToast('Link copied to clipboard!');
  };

  const authorAvatar =
    post.authorPic ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`;

  const currentAvatar =
    userProfile?.photoURL ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`;

  return (
    <article className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-slate-900 hover:text-blue-600 cursor-pointer transition">
                {post.authorName}
              </h3>
              {post.authorId === user?.uid && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded-full font-medium">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span>•</span>
              <Globe className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Options Dropdown for Author */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Post Options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleDeletePost();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content / Edit Form */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full p-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
            <input
              type="url"
              value={editMediaUrl}
              onChange={(e) => setEditMediaUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className="w-full p-2 bg-white text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editLoading || !editContent.trim()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
              >
                {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        )}
      </div>

      {/* Post Image Media */}
      {post.mediaUrl && !isEditing && (
        <div
          onClick={() => setImageModalOpen(true)}
          className="relative bg-slate-100 overflow-hidden cursor-pointer max-h-[500px] flex items-center justify-center group"
        >
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="w-full max-h-[500px] object-cover group-hover:scale-[1.01] transition duration-200"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Likes and Comments Counters Row */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          {likeCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-xs">
              <ThumbsUp className="w-2.5 h-2.5 fill-white" />
            </span>
          )}
          <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:underline cursor-pointer"
        >
          {comments.length > 0 ? `${comments.length} comments` : 'Comments'}
        </button>
      </div>

      {/* Action Buttons Row */}
      <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100 text-slate-600 font-medium text-xs sm:text-sm">
        {/* Like Button */}
        <button
          onClick={handleToggleLike}
          disabled={likeLoading}
          className={`flex items-center justify-center gap-2 flex-1 py-2 rounded-lg transition cursor-pointer hover:bg-slate-50 ${
            isLiked ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-blue-600 text-blue-600 scale-110' : ''} transition-transform`} />
          <span>Like</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-2 flex-1 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 flex-1 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-slate-50 p-4 space-y-3 animate-in fade-in duration-200">
          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-start gap-2.5">
            <img
              src={currentAvatar}
              alt="You"
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 mt-0.5"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3.5 py-2 pr-9 bg-white border border-slate-200 text-xs sm:text-sm rounded-2xl focus:border-blue-500 focus:outline-hidden shadow-2xs"
              />
              <button
                type="submit"
                disabled={commentLoading || !newCommentText.trim()}
                className="absolute right-2 top-2 text-blue-600 hover:text-blue-800 disabled:opacity-30 cursor-pointer transition p-0.5"
                title="Send comment"
              >
                {commentLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 pt-1">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-2">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => {
                const commentAvatar =
                  comment.authorPic ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`;
                const canDelete =
                  user?.uid === comment.authorId || user?.uid === post.authorId;

                return (
                  <div key={comment.id} className="flex items-start gap-2.5 group">
                    <img
                      src={commentAvatar}
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 mt-1"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="bg-white rounded-2xl px-3 py-2 border border-slate-200 inline-block max-w-[92%] shadow-2xs">
                        <span className="font-semibold text-xs text-slate-900 block">
                          {comment.authorName}
                        </span>
                        <p className="text-xs text-slate-800 mt-0.5 break-words">
                          {comment.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pl-2 mt-0.5">
                        <span>{formatRelativeTime(comment.createdAt)}</span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Delete comment"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {imageModalOpen && post.mediaUrl && (
        <div
          onClick={() => setImageModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={post.mediaUrl}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
};
