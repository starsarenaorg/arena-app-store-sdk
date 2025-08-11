export interface ArenaUserProfile {
  userId: string;
  /**
   * @deprecated Use userHandle instead.
   */
  username: string;
  userHandle: string;
  userName: string;
  userImageUrl: string;
}