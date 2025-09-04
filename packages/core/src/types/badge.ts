/**
 * Represents a badge type entity from the backend.
 */
export interface BadgeTypeEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  handle: string;
  name: string;
  imageURL: string;
  groupId: string;
  isRevealed: boolean;
  isDynamic: boolean;
  order: number;
}

/**
 * Represents a user badge entity from the backend.
 */
export interface BadgeEntity {
  id: number;
  userId: string;
  badgeType: number;
  order: number;
  isVisible: boolean;
  badgeTypeEntity: BadgeTypeEntity;
}
