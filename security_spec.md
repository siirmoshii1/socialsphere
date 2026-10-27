# Security Specification & Threat Model

## 1. Data Invariants
1. **User Profile Invariant**: A user document at `/users/{userId}` can only be created or updated by an authenticated user where `request.auth.uid == userId`.
2. **Post Identity Invariant**: A post at `/posts/{postId}` must have `authorId == request.auth.uid` on creation, and `authorId` and `createdAt` are immutable on update.
3. **Post Modification Invariant**: Only the original author can edit post content/mediaUrl or delete the post.
4. **Like Interaction Invariant**: Any authenticated user can like a post by creating `/posts/{postId}/likes/{userId}` where `userId == request.auth.uid`. A post's `likesCount` can only be updated if it corresponds to a valid like/unlike delta (+1 or -1) or by the author.
5. **Comment Invariant**: A comment at `/posts/{postId}/comments/{commentId}` must have `authorId == request.auth.uid`. Only the comment author or post author can delete it.
6. **Friend Connection Invariant**: Users can manage their own friend list `/users/{userId}/friends/{friendId}` where `request.auth.uid == userId`.
7. **Read Visibility**: All authenticated users can read users, posts, comments, and like records.
8. **Catch-All Default Deny**: All unmapped paths or unauthenticated access to writes are strictly denied.

## 2. The "Dirty Dozen" Threat Payloads (Must be Denied)
1. **Payload 1 (Impersonate Post Author on Create)**: Non-matching `authorId` in `/posts/post1` where payload has `authorId: "victim_uid"`.
2. **Payload 2 (Ghost Fields / Shadow Update)**: Post update adding unapproved fields like `{ "isVerifiedAdmin": true }`.
3. **Payload 3 (Junk Document ID / Resource Exhaustion)**: Path variable `{postId}` exceeding 128 characters or containing illegal control characters.
4. **Payload 4 (Tampering with Post Author on Update)**: Attempting to change `authorId` from original creator to attacker UID.
5. **Payload 5 (Unauthenticated Post Creation)**: Unauthenticated request attempting to write to `/posts/post123`.
6. **Payload 6 (Comment Impersonation)**: Attempting to write a comment with `authorId: "someone_else"`.
7. **Payload 7 (Massive Content Payload / Denial of Wallet)**: Post content exceeding 2000 characters or 1MB string.
8. **Payload 8 (Foreign User Profile Tampering)**: User A attempting to update `/users/userB` profile information or bio.
9. **Payload 9 (Arbitrary Negative Likes Count)**: Attempting to update `likesCount: -9999`.
10. **Payload 10 (Foreign Friend List Hijack)**: User A attempting to add or remove friend records inside `/users/userB/friends/friendC`.
11. **Payload 11 (Timestamp Falsification)**: Client attempting to forge `createdAt` back to the year 1999 instead of server timestamp.
12. **Payload 12 (Direct Delete of Another User's Post)**: Attacker attempting to issue a DELETE operation on `/posts/{postId}` created by a different user.
