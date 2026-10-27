export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  email?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPic?: string;
  content: string;
  mediaUrl?: string;
  likesCount: number;
  createdAt: any;
  updatedAt?: any;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPic?: string;
  content: string;
  createdAt: any;
  updatedAt?: any;
}

export interface LikeRecord {
  userId: string;
  createdAt: any;
}

export interface FriendConnection {
  id: string;
  friendId: string;
  displayName: string;
  photoURL?: string;
  status: 'pending' | 'accepted';
  createdAt: any;
}
