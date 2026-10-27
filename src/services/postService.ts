import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Post, Comment } from '../types';

/**
 * Creates a new post in /posts
 */
export async function createPost(
  authorId: string,
  authorName: string,
  authorPic: string | undefined,
  content: string,
  mediaUrl?: string
): Promise<string> {
  const postsRef = collection(db, 'posts');
  const postData: any = {
    authorId,
    authorName,
    content: content.trim(),
    likesCount: 0,
    createdAt: serverTimestamp(),
  };

  if (authorPic && authorPic.trim()) {
    postData.authorPic = authorPic.trim();
  }
  if (mediaUrl && mediaUrl.trim()) {
    postData.mediaUrl = mediaUrl.trim();
  }

  try {
    const docRef = await addDoc(postsRef, postData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'posts');
  }
}

/**
 * Updates an existing post's text or mediaUrl (only by author)
 */
export async function updatePost(
  postId: string,
  content: string,
  mediaUrl?: string
): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  const updates: any = {
    content: content.trim(),
    updatedAt: serverTimestamp(),
  };

  if (mediaUrl !== undefined) {
    updates.mediaUrl = mediaUrl.trim();
  }

  try {
    await updateDoc(postRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
  }
}

/**
 * Deletes a post
 */
export async function deletePost(postId: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  try {
    await deleteDoc(postRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
  }
}

/**
 * Real-time subscription to news feed posts, newest first
 */
export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  onError?: (err: any) => void
) {
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    postsQuery,
    (snapshot) => {
      const posts: Post[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          authorId: data.authorId,
          authorName: data.authorName,
          authorPic: data.authorPic,
          content: data.content,
          mediaUrl: data.mediaUrl,
          likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      callback(posts);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'posts');
    }
  );
}

/**
 * Toggles like on a post using subcollection /posts/{postId}/likes/{userId}
 * and atomically updating the post's likesCount
 */
export async function toggleLikePost(
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  const postRef = doc(db, 'posts', postId);
  const likeDocRef = doc(db, 'posts', postId, 'likes', userId);

  try {
    const batch = writeBatch(db);

    if (currentlyLiked) {
      // Unlike: remove like record, decrement count
      batch.delete(likeDocRef);
      batch.update(postRef, {
        likesCount: increment(-1),
      });
      await batch.commit();
      return false;
    } else {
      // Like: add like record, increment count
      batch.set(likeDocRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      batch.update(postRef, {
        likesCount: increment(1),
      });
      await batch.commit();
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `posts/${postId}/likes/${userId}`);
  }
}

/**
 * Checks if a specific user has liked a post
 */
export async function checkUserLiked(postId: string, userId: string): Promise<boolean> {
  try {
    const likeSnap = await getDoc(doc(db, 'posts', postId, 'likes', userId));
    return likeSnap.exists();
  } catch {
    return false;
  }
}

/**
 * Real-time listener for current user's like state on a post
 */
export function subscribeToUserLike(
  postId: string,
  userId: string,
  callback: (liked: boolean) => void
) {
  const likeDocRef = doc(db, 'posts', postId, 'likes', userId);
  return onSnapshot(
    likeDocRef,
    (snap) => {
      callback(snap.exists());
    },
    (error) => {
      console.warn('Like listener error:', error);
    }
  );
}

/**
 * Subscribes to real-time comments on a post
 */
export function subscribeToComments(
  postId: string,
  callback: (comments: Comment[]) => void
) {
  const commentsQuery = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    commentsQuery,
    (snapshot) => {
      const comments: Comment[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          authorId: data.authorId,
          authorName: data.authorName,
          authorPic: data.authorPic,
          content: data.content,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      callback(comments);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `posts/${postId}/comments`);
    }
  );
}

/**
 * Adds a comment to a post
 */
export async function addComment(
  postId: string,
  authorId: string,
  authorName: string,
  authorPic: string | undefined,
  content: string
): Promise<string> {
  const commentsRef = collection(db, 'posts', postId, 'comments');
  const commentData: any = {
    authorId,
    authorName,
    content: content.trim(),
    createdAt: serverTimestamp(),
  };

  if (authorPic && authorPic.trim()) {
    commentData.authorPic = authorPic.trim();
  }

  try {
    const docRef = await addDoc(commentsRef, commentData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments`);
  }
}

/**
 * Deletes a comment
 */
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  const commentRef = doc(db, 'posts', postId, 'comments', commentId);
  try {
    await deleteDoc(commentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}/comments/${commentId}`);
  }
}
