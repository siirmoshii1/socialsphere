import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { FriendConnection, UserProfile } from '../types';

/**
 * Subscribes to the current user's friends subcollection
 */
export function subscribeToFriends(
  userId: string,
  callback: (friends: FriendConnection[]) => void
) {
  const friendsRef = collection(db, 'users', userId, 'friends');

  return onSnapshot(
    friendsRef,
    (snapshot) => {
      const friends: FriendConnection[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          friendId: data.friendId || docSnap.id,
          displayName: data.displayName || 'Friend',
          photoURL: data.photoURL,
          status: data.status || 'accepted',
          createdAt: data.createdAt,
        };
      });
      callback(friends);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/friends`);
    }
  );
}

/**
 * Adds a friend connection in /users/{userId}/friends/{friendId}
 */
export async function addFriend(
  userId: string,
  friendUser: { uid: string; displayName: string; photoURL?: string }
): Promise<void> {
  const friendDocRef = doc(db, 'users', userId, 'friends', friendUser.uid);
  const friendData: any = {
    friendId: friendUser.uid,
    displayName: friendUser.displayName || 'User',
    status: 'accepted',
    createdAt: serverTimestamp(),
  };

  if (friendUser.photoURL) {
    friendData.photoURL = friendUser.photoURL;
  }

  try {
    await setDoc(friendDocRef, friendData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/friends/${friendUser.uid}`);
  }
}

/**
 * Removes a friend connection
 */
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const friendDocRef = doc(db, 'users', userId, 'friends', friendId);
  try {
    await deleteDoc(friendDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/friends/${friendId}`);
  }
}

/**
 * Fetches other users from Firestore to discover and suggest friends
 */
export async function fetchSuggestedUsers(currentUserId: string): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(20));
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];

    snapshot.forEach((docSnap) => {
      if (docSnap.id !== currentUserId) {
        const data = docSnap.data();
        users.push({
          uid: docSnap.id,
          displayName: data.displayName || 'User',
          photoURL: data.photoURL,
          bio: data.bio,
          createdAt: data.createdAt,
        });
      }
    });

    return users;
  } catch (error) {
    console.warn('Error fetching suggested users:', error);
    return [];
  }
}
