// ============================================================
// Auth & User Enums
// ============================================================

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  MEMORIALIZED = 'memorialized',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  CUSTOM = 'custom',
  UNDISCLOSED = 'undisclosed',
}

export enum RelationshipStatus {
  SINGLE = 'single',
  IN_RELATIONSHIP = 'in_relationship',
  ENGAGED = 'engaged',
  MARRIED = 'married',
  COMPLICATED = 'complicated',
  SEPARATED = 'separated',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  UNDISCLOSED = 'undisclosed',
}

export enum Audience {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  FRIENDS_OF_FRIENDS = 'friends_of_friends',
  ONLY_ME = 'only_me',
  CUSTOM = 'custom',
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  ONLY_ME = 'only_me',
}

export enum TwoFactorMethod {
  SMS = 'sms',
  AUTHENTICATOR = 'authenticator',
}

// ============================================================
// Social Graph Enums
// ============================================================

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
}

export enum FriendListType {
  CLOSE_FRIENDS = 'close_friends',
  ACQUAINTANCES = 'acquaintances',
  RESTRICTED = 'restricted',
  NONE = 'none',
}

export enum FollowingType {
  USER = 'user',
  PAGE = 'page',
  GROUP = 'group',
}

export enum FollowPriority {
  DEFAULT = 'default',
  FAVORITES = 'favorites',
  UNFOLLOW = 'unfollow',
}

export enum FollowStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
}

export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

// ============================================================
// Content — Post Enums
// ============================================================

export enum PostStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PostType {
  TEXT = 'text',
  PHOTO = 'photo',
  VIDEO = 'video',
  LINK = 'link',
  FEELING = 'feeling',
  CHECK_IN = 'check_in',
  MEMORY = 'memory',
  POLL = 'poll',
  REEL = 'reel',
}

export enum PostMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  REEL = 'reel',
  GIF = 'gif',
}

export enum StoryType {
  PHOTO = 'photo',
  VIDEO = 'video',
  TEXT = 'text',
  BOOMERANG = 'boomerang',
}

export enum StoryAudience {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  CUSTOM = 'custom',
}

// ============================================================
// Content — Article Enums
// ============================================================

export enum ArticleStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ArticleVersionStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ArticleAssetType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

// ============================================================
// Engagement Enums
// ============================================================

export enum ReactionTargetType {
  POST = 'post',
  COMMENT = 'comment',
  MESSAGE = 'message',
  STORY = 'story',
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  CARE = 'care',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

export enum CommentType {
  TEXT = 'text',
  VOICE = 'voice',
  MEDIA = 'media',
}

export enum CommentTargetType {
  POST = 'post',
  ARTICLE = 'article',
  PHOTO = 'photo',
}

export enum ShareToType {
  TIMELINE = 'timeline',
  GROUP = 'group',
  PAGE = 'page',
  MESSAGE = 'message',
  EXTERNAL = 'external',
}

export enum ShareAudience {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  ONLY_ME = 'only_me',
}

export enum BookmarkTargetType {
  POST = 'post',
  ARTICLE = 'article',
}

export enum FeedEntityType {
  POST = 'post',
  STORY = 'story',
  ARTICLE = 'article',
  FOLLOW = 'follow',
  REACTION = 'reaction',
  COMMENT = 'comment',
  SHARE = 'share',
}

// ============================================================
// Groups Enums
// ============================================================

export enum GroupPrivacy {
  PUBLIC = 'public',
  CLOSED = 'closed',
  SECRET = 'secret',
}

export enum GroupType {
  GENERAL = 'general',
  BUY_SELL = 'buy_sell',
  GAMING = 'gaming',
  PARENTING = 'parenting',
  TRAVEL = 'travel',
  OTHER = 'other',
}

export enum GroupMemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

export enum GroupMemberStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  BANNED = 'banned',
}

// ============================================================
// Pages Enums
// ============================================================

export enum PageAdminRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
  ADVERTISER = 'advertiser',
  ANALYST = 'analyst',
}

// ============================================================
// Marketplace Enums
// ============================================================

export enum ListingCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}

// ============================================================
// Messaging Enums
// ============================================================

export enum ConversationType {
  DIRECT = 'direct',
  PRIVATE = 'private',
  GROUP = 'group',
  MARKETPLACE = 'marketplace',
}

export enum ConversationParticipantRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  STICKER = 'sticker',
  VOICE = 'voice',
  VIDEO_CALL_LOG = 'video_call_log',
  SYSTEM = 'system',
  VIDEO = 'video',
}

// ============================================================
// Notifications Enums
// ============================================================

export enum PushPlatform {
  FCM = 'fcm',
  APNS = 'apns',
  WEB = 'web',
}

// ============================================================
// WebSocket & Ops Enums
// ============================================================

export enum DeviceType {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
}

export enum ReportTargetType {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user',
  GROUP = 'group',
  PAGE = 'page',
  MARKETPLACE_LISTING = 'marketplace_listing',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  DISMISSED = 'dismissed',
}

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MEMBER = 'MEMBER',
}

export enum MessagePermission {
  EVERYONE = 'everyone',
  FRIENDS = 'friends',
  FOLLOWERS = 'followers',
  NONE = 'none',
}

// =============================
// AdminRole
// =============================

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}
