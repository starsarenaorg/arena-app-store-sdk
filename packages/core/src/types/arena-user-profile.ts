import { BadgeEntity } from './badge';

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

  /**
   * The number of followers the user has.
   */
  followerCount: number;

  /**
   * Array of badges associated with the user.
   */
  badges: BadgeEntity[];

  /**
   * Number of ticket holdings by the user.
   */
  ticketHoldings: number;

  /**
   * Total number of ticket holders.
   */
  ticketHolders: number;

  /**
   * Total token holdings of the user.
   */
  tokenHoldings: number;
}