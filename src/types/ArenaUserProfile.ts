/**
 * Represents a Arena user profile.
 */
export interface ArenaUserProfile {
  /**
   * Unique identifier for the Arena user.
   */
  userId: string;

  /**
   * @deprecated Use userHandle instead.
   * The handle of the Arena user.
   */
  username: string;

  /**
   * The handle of the Arena user.
   */
  userHandle: string;

  /**
   * The display name of the Arena user.
   */
  userName: string;

  /**
   * URL to the user's Arena profile image.
   */
  userImageUrl: string;
}