import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string, photoURL?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileData: (data: { displayName?: string; photoURL?: string; bio?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Validate Firestore connectivity on initial mount
  useEffect(() => {
    testConnection();
  }, []);

  // Fetch or create user profile doc in Cloud Firestore
  const syncUserProfile = async (firebaseUser: User) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile({
          uid: firebaseUser.uid,
          displayName: data.displayName || firebaseUser.displayName || 'User',
          photoURL: data.photoURL || firebaseUser.photoURL || '',
          bio: data.bio || '',
          email: firebaseUser.email || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } else {
        // Create initial profile document
        const newProfile: any = {
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          bio: 'Hey there! I am using SocialSphere.',
          createdAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile({
          uid: firebaseUser.uid,
          displayName: newProfile.displayName,
          photoURL: newProfile.photoURL,
          bio: newProfile.bio,
          email: firebaseUser.email || '',
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Error synchronizing user profile:', err);
      // Fallback local representation if network glitch or permission error
      setUserProfile({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
        bio: 'Hey there! I am using SocialSphere.',
        email: firebaseUser.email || '',
        createdAt: new Date(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user);
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      await syncUserProfile(result.user);
    } catch (error: any) {
      console.error('Email sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string, photoURL?: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const chosenAvatar = photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || cred.user.uid)}`;
      
      await updateProfile(cred.user, {
        displayName: displayName.trim(),
        photoURL: chosenAvatar,
      });

      const userDocRef = doc(db, 'users', cred.user.uid);
      const newProfile = {
        displayName: displayName.trim(),
        photoURL: chosenAvatar,
        bio: 'Hey there! I am using SocialSphere.',
        createdAt: serverTimestamp(),
      };

      try {
        await setDoc(userDocRef, newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
      }

      setUserProfile({
        uid: cred.user.uid,
        displayName: newProfile.displayName,
        photoURL: newProfile.photoURL,
        bio: newProfile.bio,
        email: cred.user.email || '',
        createdAt: new Date(),
      });
    } catch (error: any) {
      console.error('Sign-up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfileData = async (data: { displayName?: string; photoURL?: string; bio?: string }) => {
    if (!user) throw new Error('Not authenticated');
    const userDocRef = doc(db, 'users', user.uid);
    const updates: any = {};
    if (data.displayName !== undefined) updates.displayName = data.displayName.trim();
    if (data.photoURL !== undefined) updates.photoURL = data.photoURL.trim();
    if (data.bio !== undefined) updates.bio = data.bio.trim();
    updates.updatedAt = serverTimestamp();

    try {
      await updateDoc(userDocRef, updates);
      if (data.displayName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.displayName ?? user.displayName,
          photoURL: data.photoURL ?? user.photoURL,
        });
      }
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        updateUserProfileData,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
