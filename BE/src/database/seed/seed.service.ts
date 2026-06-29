import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

// Nhập 56/57 entities
import { Permission } from 'src/v1/entities/permission.entity';
import { Profile } from 'src/v1/entities/profile.entity';
import { Role } from 'src/v1/entities/role.entity';
import { RolePermission } from 'src/v1/entities/role_permission.entity';
import { User } from 'src/v1/entities/user.entity';
import { UserPresence } from 'src/v1/entities/user_presence.entity';
import { UserRole } from 'src/v1/entities/user_role.entity';
import { UserSettings } from 'src/v1/entities/user_settings.entity';
import { UserStats } from 'src/v1/entities/user_stats.entity';

import { Post } from 'src/v1/entities/post.entity';
import { PostHashtag } from 'src/v1/entities/post_hashtag.entity';
import { PostMedia } from 'src/v1/entities/post_media.entity';
import { PostTag } from 'src/v1/entities/post_tag.entity';

import { Comment } from 'src/v1/entities/comment.entity';
import { Reaction } from 'src/v1/entities/reaction.entity';
import { Share } from 'src/v1/entities/share.entity';

import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupRule } from 'src/v1/entities/group_rule.entity';

import { Page } from 'src/v1/entities/page.entity';
import { PageAdmin } from 'src/v1/entities/page_admin.entity';

import { Conversation } from 'src/v1/entities/conversation.entity';
import { ConversationParticipant } from 'src/v1/entities/conversation_participant.entity';
import { Message } from 'src/v1/entities/message.entity';
import { MessageReaction } from 'src/v1/entities/message_reaction.entity';

import { Block } from 'src/v1/entities/block.entity';
import { Follow } from 'src/v1/entities/follow.entity';
import { Friend } from 'src/v1/entities/friend.entity';
import { FriendRequest } from 'src/v1/entities/friend_request.entity';

import { Category } from 'src/v1/entities/category.entity';
import { Hashtag } from 'src/v1/entities/hashtag.entity';
import { Tag } from 'src/v1/entities/tag.entity';

import { Article } from 'src/v1/entities/article.entity';
import { ArticleAsset } from 'src/v1/entities/article_asset.entity';
import { ArticleVersion } from 'src/v1/entities/article_version.entity';

import { Story } from 'src/v1/entities/story.entity';
import { StoryView } from 'src/v1/entities/story_view.entity';

import { Poll } from 'src/v1/entities/poll.entity';
import { PollOption } from 'src/v1/entities/poll_option.entity';
import { PollVote } from 'src/v1/entities/poll_vote.entity';

import { Listing } from 'src/v1/entities/listing.entity';
import { ListingInquiry } from 'src/v1/entities/listing_inquiry.entity';
import { ListingMedia } from 'src/v1/entities/listing_media.entity';

import { Bookmark } from 'src/v1/entities/bookmark.entity';
import { BookmarkCollection } from 'src/v1/entities/bookmark_collection.entity';
import { Feed } from 'src/v1/entities/feed.entity';

import { Notification } from 'src/v1/entities/notification.entity';
import { NotificationPreference } from 'src/v1/entities/notification_preference.entity';

import { PushToken } from 'src/v1/entities/push_token.entity';
import { RefreshToken } from 'src/v1/entities/refresh_token.entity';

import { AuditLog } from 'src/v1/entities/audit_log.entity';
import { Report } from 'src/v1/entities/report.entity';
import { SeoMeta } from 'src/v1/entities/seo_meta.entity';

import {
  ArticleStatus,
  Audience,
  BookmarkTargetType,
  CommentType,
  ConversationType,
  FeedEntityType,
  FollowingType,
  FollowStatus,
  FriendRequestStatus,
  Gender,
  GroupMemberRole,
  GroupMemberStatus,
  GroupPrivacy,
  GroupType,
  ListingCondition,
  ListingStatus,
  MessagePermission,
  MessageType,
  PostMediaType,
  PostStatus,
  PostType,
  PresenceStatus,
  ProfileVisibility,
  PushPlatform,
  ReactionTargetType,
  ReactionType,
  RelationshipStatus,
  ReportTargetType,
  ShareToType,
  StoryAudience,
  StoryType,
  UserStatus,
} from 'src/constants/enums';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async seedAll() {
    this.logger.log('Starting massive database seed...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');

      // 1. Truncate ALL tables dynamically
      const entities = this.dataSource.entityMetadatas;
      for (const entity of entities) {
        await queryRunner.query(`TRUNCATE TABLE \`${entity.tableName}\``);
      }
      this.logger.log('All tables truncated successfully.');

      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');

      // ==========================================
      // SECTION 1: AUTH & SYSTEM CORE
      // ==========================================

      // Permissions & Roles
      const permRepo = this.dataSource.getRepository(Permission);
      const roleRepo = this.dataSource.getRepository(Role);
      const rolePermRepo = this.dataSource.getRepository(RolePermission);

      const p1 = await permRepo.save({
        name: 'MANAGE_USERS',
        code: 'MANAGE_USERS',
        module: 'ADMIN',
        description: 'Quản lý user',
      });
      const r1 = await roleRepo.save({
        name: 'SUPER_ADMIN',
        description: 'Admin tối cao',
      });
      const r2 = await roleRepo.save({
        name: 'MEMBER',
        description: 'Người dùng thường',
      });

      await rolePermRepo.save({ role_id: r1.id, permission_id: p1.id });

      // ==========================================
      // SECTION 2: USERS & PROFILES
      // ==========================================

      const passwordHash = await bcrypt.hash('123456', 10);

      const userRepo = this.dataSource.getRepository(User);
      const profileRepo = this.dataSource.getRepository(Profile);
      const settingsRepo = this.dataSource.getRepository(UserSettings);
      const statsRepo = this.dataSource.getRepository(UserStats);
      const presenceRepo = this.dataSource.getRepository(UserPresence);
      const userRoleRepo = this.dataSource.getRepository(UserRole);

      const friendRepo = this.dataSource.getRepository(Friend);
      const followRepo = this.dataSource.getRepository(Follow);
      const friendReqRepo = this.dataSource.getRepository(FriendRequest);
      const blockRepo = this.dataSource.getRepository(Block);

      this.logger.log('Generating 10,000 users...');
      const userIds: string[] = [];
      const usernamesSet = new Set<string>();

      const USER_CHUNK_SIZE = 1000;
      const TOTAL_USERS = 10000;

      for (
        let chunkStart = 0;
        chunkStart < TOTAL_USERS;
        chunkStart += USER_CHUNK_SIZE
      ) {
        const usersChunk: any[] = [];
        const profilesChunk: any[] = [];
        const settingsChunk: any[] = [];
        const statsChunk: any[] = [];
        const presenceChunk: any[] = [];
        const userRolesChunk: any[] = [];

        const endLimit = Math.min(chunkStart + USER_CHUNK_SIZE, TOTAL_USERS);
        for (let i = chunkStart + 1; i <= endLimit; i++) {
          const userId = faker.string.uuid();
          userIds.push(userId);

          let username = `user_${i}`;
          if (usernamesSet.has(username)) {
            username = `user_${i}_${faker.string.alphanumeric(4)}`;
          }
          usernamesSet.add(username);

          usersChunk.push({
            id: userId,
            email: `user${i}@example.com`,
            password: passwordHash,
            status: UserStatus.ACTIVE,
            is_active_status: true,
            message_permission: MessagePermission.EVERYONE,
          });

          profilesChunk.push({
            id: faker.string.uuid(),
            user_id: userId,
            full_name: `${faker.person.firstName()} ${faker.person.lastName()}`,
            username: username,
            bio: faker.lorem.sentence(10).substring(0, 255),
            avatar_url: `https://i.pravatar.cc/150?u=${userId}`,
            cover_url: `https://picsum.photos/800/400?random=${i}`,
            gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
            date_of_birth: faker.date.birthdate({
              min: 18,
              max: 50,
              mode: 'age',
            }),
            location_city: faker.location.city(),
            location_country: faker.location.country(),
            relationship_status: RelationshipStatus.SINGLE,
            language: 'vi',
            timezone: 'Asia/Ho_Chi_Minh',
          });

          settingsChunk.push({
            user_id: userId,
            post_default_audience: Audience.FRIENDS,
            profile_visibility: ProfileVisibility.FRIENDS,
            friend_list_visibility: ProfileVisibility.FRIENDS,
            following_list_visibility: ProfileVisibility.FRIENDS,
            tag_review_enabled: true,
            timeline_review_enabled: false,
            face_recognition_enabled: false,
            two_factor_enabled: false,
            ad_personalization: true,
          });

          statsChunk.push({
            user_id: userId,
            friend_count: 0,
            follower_count: 0,
            following_count: 0,
            post_count: 0,
          });

          presenceChunk.push({
            user_id: userId,
            status:
              Math.random() > 0.5
                ? PresenceStatus.ONLINE
                : PresenceStatus.OFFLINE,
            last_seen_at: new Date(),
            is_invisible: false,
          });

          userRolesChunk.push({
            user_id: userId,
            role_id: i === 1 ? r1.id : r2.id,
          });
        }

        await queryRunner.manager.insert(User, usersChunk);
        await queryRunner.manager.insert(Profile, profilesChunk);
        await queryRunner.manager.insert(UserSettings, settingsChunk);
        await queryRunner.manager.insert(UserStats, statsChunk);
        await queryRunner.manager.insert(UserPresence, presenceChunk);
        await queryRunner.manager.insert(UserRole, userRolesChunk);
      }
      this.logger.log('Users and profiles generated successfully.');

      // ==========================================
      // SECTION 3: GROUPS & MEMBERS
      // ==========================================
      this.logger.log('Generating 1,000 groups...');
      const groupRepo = this.dataSource.getRepository(Group);
      const groupMemRepo = this.dataSource.getRepository(GroupMember);
      const groupRuleRepo = this.dataSource.getRepository(GroupRule);

      const groupsChunk: any[] = [];
      const groupIds: string[] = [];

      for (let i = 1; i <= 1000; i++) {
        const groupId = faker.string.uuid();
        groupIds.push(groupId);
        const creatorId = userIds[Math.floor(Math.random() * userIds.length)];

        groupsChunk.push({
          id: groupId,
          name: `Club ${faker.word.noun()} ${i}`,
          slug: `club-${i}-${faker.string.alphanumeric(6).toLowerCase()}`,
          description: faker.lorem.paragraph().substring(0, 500),
          avatar_url: `https://picsum.photos/150?random=${i}`,
          cover_url: `https://picsum.photos/800/300?random=${i}`,
          privacy:
            Math.random() > 0.5 ? GroupPrivacy.PUBLIC : GroupPrivacy.CLOSED,
          type: GroupType.GENERAL,
          member_count: 0,
          post_count: 0,
          created_by: creatorId,
        });
      }

      const GROUP_CHUNK_SIZE = 200;
      for (let i = 0; i < groupsChunk.length; i += GROUP_CHUNK_SIZE) {
        await queryRunner.manager.insert(
          Group,
          groupsChunk.slice(i, i + GROUP_CHUNK_SIZE),
        );
      }
      this.logger.log('Groups inserted successfully.');

      this.logger.log(
        'Generating group memberships (including large groups)...',
      );
      const groupMembersList: any[] = [];
      const membershipSet = new Set<string>();

      // Creator gets ADMIN role
      for (const group of groupsChunk) {
        groupMembersList.push({
          group_id: group.id,
          user_id: group.created_by,
          role: GroupMemberRole.ADMIN,
          status: GroupMemberStatus.ACTIVE,
        });
        membershipSet.add(`${group.id}-${group.created_by}`);
      }

      // First 5 groups are "large groups" (1000 to 2000 members each)
      // Others get 5 to 15 members
      for (let g = 0; g < groupIds.length; g++) {
        const groupId = groupIds[g];
        const isLarge = g < 5;
        const memberCountToSeed = isLarge
          ? faker.number.int({ min: 1000, max: 2000 })
          : faker.number.int({ min: 5, max: 15 });

        const selectedUserIds = new Set<string>();
        while (selectedUserIds.size < memberCountToSeed) {
          const randUserId =
            userIds[Math.floor(Math.random() * userIds.length)];
          selectedUserIds.add(randUserId);
        }

        for (const uid of selectedUserIds) {
          const key = `${groupId}-${uid}`;
          if (!membershipSet.has(key)) {
            groupMembersList.push({
              group_id: groupId,
              user_id: uid,
              role: GroupMemberRole.MEMBER,
              status: GroupMemberStatus.ACTIVE,
            });
            membershipSet.add(key);
          }
        }
      }

      const MEM_CHUNK_SIZE = 1000;
      for (let i = 0; i < groupMembersList.length; i += MEM_CHUNK_SIZE) {
        await queryRunner.manager.insert(
          GroupMember,
          groupMembersList.slice(i, i + MEM_CHUNK_SIZE),
        );
      }
      this.logger.log(`Inserted ${groupMembersList.length} group memberships.`);

      this.logger.log('Updating group member counts...');
      await queryRunner.query(`
        UPDATE \`groups\` g
        SET member_count = (
          SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id
        )
      `);

      // ==========================================
      // SECTION 4: POSTS
      // ==========================================
      this.logger.log('Generating ~10,000 posts...');
      const postRepo = this.dataSource.getRepository(Post);
      const postsList: any[] = [];
      const postIds: string[] = [];

      const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
      const totalPostsTarget = 10000;
      let postsCreated = 0;
      let privatePostsCount = 0;
      const targetPrivatePosts = faker.number.int({ min: 2000, max: 3000 });

      for (const userId of shuffledUsers) {
        if (postsCreated >= totalPostsTarget) {
          break;
        }

        const userPostCount = faker.number.int({ min: 10, max: 80 });
        const postsToCreate = Math.min(
          userPostCount,
          totalPostsTarget - postsCreated,
        );

        for (let p = 0; p < postsToCreate; p++) {
          const postId = faker.string.uuid();
          postIds.push(postId);

          let audience = Audience.PUBLIC;
          const remainingPosts = totalPostsTarget - postsCreated;
          const remainingPrivateNeeded = targetPrivatePosts - privatePostsCount;

          if (
            remainingPrivateNeeded > 0 &&
            (Math.random() < 0.28 || remainingPrivateNeeded >= remainingPosts)
          ) {
            audience = Audience.ONLY_ME;
            privatePostsCount++;
          }

          let groupId: string | null = null;
          if (audience === Audience.PUBLIC && Math.random() < 0.2) {
            groupId = groupIds[Math.floor(Math.random() * groupIds.length)];
          }

          postsList.push({
            id: postId,
            user_id: userId,
            group_id: groupId,
            content: faker.lorem.paragraphs(
              faker.number.int({ min: 1, max: 3 }),
            ),
            type: PostType.TEXT,
            audience: audience,
            status: PostStatus.APPROVED,
            view_count: faker.number.int({ min: 0, max: 1000 }),
            share_count: 0,
            reaction_count: 0,
            comment_count: 0,
          });

          postsCreated++;
        }
      }

      for (let i = 0; i < postsList.length; i += 1000) {
        await queryRunner.manager.insert(Post, postsList.slice(i, i + 1000));
      }
      this.logger.log(
        `Inserted ${postsList.length} posts (Private posts: ${privatePostsCount}).`,
      );

      this.logger.log('Updating group post counts...');
      await queryRunner.query(`
        UPDATE \`groups\` g
        SET post_count = (
          SELECT COUNT(*) FROM posts p WHERE p.group_id = g.id
        )
      `);

      this.logger.log('Updating user post counts in stats...');
      await queryRunner.query(`
        UPDATE user_stats us
        SET post_count = (
          SELECT COUNT(*) FROM posts p WHERE p.user_id = us.user_id
        )
      `);

      // ==========================================
      // SECTION 5: SOCIAL GRAPH RELATIONSHIPS
      // ==========================================
      this.logger.log('Generating social graph relationships...');

      // Friends (2,000 bidirectional)
      const friendData: any[] = [];
      const friendPairs = new Set<string>();
      while (friendPairs.size < 2000) {
        const userA = userIds[Math.floor(Math.random() * userIds.length)];
        const userB = userIds[Math.floor(Math.random() * userIds.length)];
        if (userA === userB) continue;

        const pairKey = [userA, userB].sort().join('-');
        if (friendPairs.has(pairKey)) continue;
        friendPairs.add(pairKey);

        friendData.push(
          { user_id: userA, friend_id: userB },
          { user_id: userB, friend_id: userA },
        );
      }
      for (let i = 0; i < friendData.length; i += 1000) {
        await queryRunner.manager.insert(Friend, friendData.slice(i, i + 1000));
      }

      await queryRunner.query(`
        UPDATE user_stats us
        SET friend_count = (
          SELECT COUNT(*) FROM friends f WHERE f.user_id = us.user_id
        )
      `);

      // Follows (5,000 follows)
      const followData: any[] = [];
      const followPairs = new Set<string>();
      while (followPairs.size < 5000) {
        const follower = userIds[Math.floor(Math.random() * userIds.length)];
        const following = userIds[Math.floor(Math.random() * userIds.length)];
        if (follower === following) continue;

        const pairKey = `${follower}-${following}`;
        if (followPairs.has(pairKey)) continue;
        followPairs.add(pairKey);

        followData.push({
          follower_id: follower,
          following_type: FollowingType.USER,
          following_entity_id: following,
          status: FollowStatus.ACTIVE,
        });
      }
      for (let i = 0; i < followData.length; i += 1000) {
        await queryRunner.manager.insert(Follow, followData.slice(i, i + 1000));
      }

      await queryRunner.query(`
        UPDATE user_stats us
        SET following_count = (
          SELECT COUNT(*) FROM follows f WHERE f.follower_id = us.user_id
        ),
        follower_count = (
          SELECT COUNT(*) FROM follows f WHERE f.following_entity_id = us.user_id AND f.following_type = 'user'
        )
      `);

      // Friend Requests (1,000 requests)
      const friendRequestData: any[] = [];
      const friendRequestPairs = new Set<string>();
      while (friendRequestPairs.size < 1000) {
        const sender = userIds[Math.floor(Math.random() * userIds.length)];
        const receiver = userIds[Math.floor(Math.random() * userIds.length)];
        if (sender === receiver) continue;

        const pairKey = `${sender}-${receiver}`;
        if (
          friendRequestPairs.has(pairKey) ||
          friendPairs.has([sender, receiver].sort().join('-'))
        )
          continue;
        friendRequestPairs.add(pairKey);

        friendRequestData.push({
          sender_id: sender,
          receiver_id: receiver,
          status:
            Math.random() > 0.3
              ? FriendRequestStatus.PENDING
              : FriendRequestStatus.ACCEPTED,
        });
      }
      for (let i = 0; i < friendRequestData.length; i += 1000) {
        await queryRunner.manager.insert(
          FriendRequest,
          friendRequestData.slice(i, i + 1000),
        );
      }

      // Blocks (200 blocks)
      const blockData: any[] = [];
      const blockPairs = new Set<string>();
      while (blockPairs.size < 200) {
        const blocker = userIds[Math.floor(Math.random() * userIds.length)];
        const blocked = userIds[Math.floor(Math.random() * userIds.length)];
        if (blocker === blocked) continue;

        const pairKey = `${blocker}-${blocked}`;
        if (blockPairs.has(pairKey)) continue;
        blockPairs.add(pairKey);

        blockData.push({
          blocker_id: blocker,
          blocked_id: blocked,
        });
      }
      for (let i = 0; i < blockData.length; i += 1000) {
        await queryRunner.manager.insert(Block, blockData.slice(i, i + 1000));
      }

      // ==========================================
      // SECTION 6: COMMENTS & REACTIONS
      // ==========================================
      this.logger.log('Generating comments and reactions...');

      const commentsList: any[] = [];
      const reactionsList: any[] = [];
      const reactionTypes = [
        ReactionType.LIKE,
        ReactionType.LOVE,
        ReactionType.CARE,
        ReactionType.HAHA,
        ReactionType.WOW,
        ReactionType.SAD,
        ReactionType.ANGRY,
      ];

      const commentedPostIds = [...postIds]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2000);
      for (const postId of commentedPostIds) {
        const commentCount = faker.number.int({ min: 1, max: 5 });
        for (let c = 0; c < commentCount; c++) {
          commentsList.push({
            id: faker.string.uuid(),
            post_id: postId,
            user_id: userIds[Math.floor(Math.random() * userIds.length)],
            content: faker.lorem.sentence(),
            type: CommentType.TEXT,
          });
        }

        const reactionCount = faker.number.int({ min: 3, max: 15 });
        const reactors = new Set<string>();
        while (reactors.size < reactionCount) {
          reactors.add(userIds[Math.floor(Math.random() * userIds.length)]);
        }

        for (const reactorId of reactors) {
          reactionsList.push({
            id: faker.string.uuid(),
            target_id: postId,
            target_type: ReactionTargetType.POST,
            user_id: reactorId,
            type: reactionTypes[
              Math.floor(Math.random() * reactionTypes.length)
            ],
          });
        }
      }

      for (let i = 0; i < commentsList.length; i += 1000) {
        await queryRunner.manager.insert(
          Comment,
          commentsList.slice(i, i + 1000),
        );
      }
      for (let i = 0; i < reactionsList.length; i += 1000) {
        await queryRunner.manager.insert(
          Reaction,
          reactionsList.slice(i, i + 1000),
        );
      }

      this.logger.log('Updating post comment and reaction counts...');
      await queryRunner.query(`
        UPDATE posts p
        SET comment_count = (
          SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id
        ),
        reaction_count = (
          SELECT COUNT(*) FROM reactions r WHERE r.target_id = p.id AND r.target_type = 'post'
        )
      `);

      // ==========================================
      // SECTION 7: OTHER CONTENT (Tags, Media, Stories, Articles, Polls)
      // ==========================================
      this.logger.log(
        'Generating auxiliary content (media, stories, articles, polls)...',
      );

      const tagRepo = this.dataSource.getRepository(Tag);
      const catRepo = this.dataSource.getRepository(Category);
      const hashtagRepo = this.dataSource.getRepository(Hashtag);

      const t1 = await tagRepo.save({ name: 'technology', slug: 'technology' });
      const c1 = await catRepo.save({ name: 'News', slug: 'news' });
      const h1 = await hashtagRepo.save({ name: 'coding' });

      // Post Media, tags, hashtags for first 500 posts
      const postMediaRepo = this.dataSource.getRepository(PostMedia);
      const postTagRepo = this.dataSource.getRepository(PostTag);
      const postHashtagRepo = this.dataSource.getRepository(PostHashtag);

      const postMediaData = [];
      const postTagData = [];
      const postHashtagData = [];
      for (let i = 0; i < Math.min(500, postIds.length); i++) {
        const pId = postIds[i];
        postMediaData.push({
          post_id: pId,
          file_url: `https://picsum.photos/600/400?random=${i}`,
          media_type: PostMediaType.IMAGE,
        });
        postTagData.push({
          post_id: pId,
          tagged_user_id: userIds[Math.floor(Math.random() * userIds.length)],
        });
        postHashtagData.push({
          post_id: pId,
          hashtag_id: h1.id,
        });
      }
      await postMediaRepo.save(postMediaData);
      await postTagRepo.save(postTagData);
      await postHashtagRepo.save(postHashtagData);

      // Polls
      const pollRepo = this.dataSource.getRepository(Poll);
      const pollOptRepo = this.dataSource.getRepository(PollOption);
      const pollVoteRepo = this.dataSource.getRepository(PollVote);

      const pollsData = [];
      for (let i = 0; i < 20; i++) {
        pollsData.push({
          id: faker.string.uuid(),
          post_id: postIds[i],
          question: `Question for poll ${i}?`,
          is_multiple_choice: false,
        });
      }
      await pollRepo.save(pollsData);

      const pollOptsData = [];
      for (const poll of pollsData) {
        pollOptsData.push(
          { id: faker.string.uuid(), poll_id: poll.id, option_text: 'Yes' },
          { id: faker.string.uuid(), poll_id: poll.id, option_text: 'No' },
        );
      }
      await pollOptRepo.save(pollOptsData);

      const pollVotesData = [];
      for (let i = 0; i < pollsData.length; i++) {
        pollVotesData.push({
          poll_id: pollsData[i].id,
          option_id: pollOptsData[i * 2].id,
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
        });
      }
      await pollVoteRepo.save(pollVotesData);

      // Stories
      const storyRepo = this.dataSource.getRepository(Story);
      const storyViewRepo = this.dataSource.getRepository(StoryView);

      const storiesData = [];
      for (let i = 0; i < 50; i++) {
        storiesData.push({
          id: faker.string.uuid(),
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          media_url: `https://picsum.photos/300/500?random=${i}`,
          type: StoryType.PHOTO,
          audience: StoryAudience.PUBLIC,
          expires_at: new Date(Date.now() + 86400000),
        });
      }
      await storyRepo.save(storiesData);

      const storyViewsData = [];
      for (const story of storiesData) {
        storyViewsData.push({
          story_id: story.id,
          viewer_id: userIds[Math.floor(Math.random() * userIds.length)],
        });
      }
      await storyViewRepo.save(storyViewsData);

      // Articles
      const articleRepo = this.dataSource.getRepository(Article);
      const articleVersionRepo = this.dataSource.getRepository(ArticleVersion);
      const articleAssetRepo = this.dataSource.getRepository(ArticleAsset);

      const articlesData = [];
      for (let i = 0; i < 20; i++) {
        articlesData.push({
          id: faker.string.uuid(),
          author_id: userIds[Math.floor(Math.random() * userIds.length)],
          title: `Article Title ${i}`,
          slug: `article-title-${i}-${faker.string.alphanumeric(4).toLowerCase()}`,
          content: faker.lorem.paragraphs(2),
          status: ArticleStatus.PUBLISHED,
          category_id: c1.id,
        });
      }
      await articleRepo.save(articlesData);

      const articleVersionsData = [];
      const articleAssetsData = [];
      for (const art of articlesData) {
        articleVersionsData.push({
          article_id: art.id,
          title: art.title,
          content: art.content,
          created_by: art.author_id,
        });
        articleAssetsData.push({
          article_id: art.id,
          file_url: 'https://img.com/a.png',
        });
      }
      await articleVersionRepo.save(articleVersionsData);
      await articleAssetRepo.save(articleAssetsData);

      // Group Rules
      const rulesData = [];
      for (let i = 0; i < Math.min(100, groupIds.length); i++) {
        rulesData.push({
          group_id: groupIds[i],
          title: 'No Spam',
          description: 'Do not post spammy links or advertising',
        });
      }
      await groupRuleRepo.save(rulesData);

      // Pages
      const pageRepo = this.dataSource.getRepository(Page);
      const pageAdminRepo = this.dataSource.getRepository(PageAdmin);

      const pagesData = [];
      for (let i = 0; i < 50; i++) {
        pagesData.push({
          id: faker.string.uuid(),
          name: `Page ${faker.word.noun()} ${i}`,
          username: `page_${i}_${faker.string.alphanumeric(4).toLowerCase()}`,
          category: 'Business',
          created_by: userIds[Math.floor(Math.random() * userIds.length)],
        });
      }
      await pageRepo.save(pagesData);

      const pageAdminsData = [];
      for (const page of pagesData) {
        pageAdminsData.push({
          page_id: page.id,
          user_id: page.created_by,
        });
      }
      await pageAdminRepo.save(pageAdminsData);

      // ==========================================
      // SECTION 8: MARKETPLACE & SHARES & BOOKMARKS
      // ==========================================
      this.logger.log('Generating marketplace, shares, and bookmarks...');

      const listingRepo = this.dataSource.getRepository(Listing);
      const listingMediaRepo = this.dataSource.getRepository(ListingMedia);
      const listingInquiryRepo = this.dataSource.getRepository(ListingInquiry);
      const localConvRepo = this.dataSource.getRepository(Conversation);

      const listingsData = [];
      for (let i = 0; i < 20; i++) {
        listingsData.push({
          id: faker.string.uuid(),
          seller_id: userIds[Math.floor(Math.random() * userIds.length)],
          title: `Item Macbook ${i}`,
          price: 1000 + i * 50,
          category: 'Electronics',
          condition: ListingCondition.NEW,
          status: ListingStatus.ACTIVE,
        });
      }
      await listingRepo.save(listingsData);

      const listingMediaData = [];
      const inquiriesData = [];
      for (const list of listingsData) {
        listingMediaData.push({
          listing_id: list.id,
          file_url: 'https://img.com/mac.png',
        });

        const listConv = await localConvRepo.save({
          type: ConversationType.DIRECT,
          created_by: userIds[0],
        });
        inquiriesData.push({
          listing_id: list.id,
          buyer_id: userIds[Math.floor(Math.random() * userIds.length)],
          conversation_id: listConv.id,
          message: 'Is this available?',
        });
      }
      await listingMediaRepo.save(listingMediaData);
      await listingInquiryRepo.save(inquiriesData);

      const shareRepo = this.dataSource.getRepository(Share);
      const bookmarkRepo = this.dataSource.getRepository(Bookmark);
      const bmColRepo = this.dataSource.getRepository(BookmarkCollection);
      const feedRepo = this.dataSource.getRepository(Feed);

      const sharesData = [];
      for (let i = 0; i < 100; i++) {
        sharesData.push({
          post_id: postIds[Math.floor(Math.random() * postIds.length)],
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          shared_to_type: ShareToType.TIMELINE,
        });
      }
      await shareRepo.save(sharesData);

      const bmColsData = [];
      for (let i = 0; i < 50; i++) {
        bmColsData.push({
          id: faker.string.uuid(),
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          name: `Favorites Collection ${i}`,
        });
      }
      await bmColRepo.save(bmColsData);

      const bookmarksData = [];
      for (let i = 0; i < 100; i++) {
        const collection =
          bmColsData[Math.floor(Math.random() * bmColsData.length)];
        bookmarksData.push({
          user_id: collection.user_id,
          target_type: BookmarkTargetType.POST,
          target_id: postIds[Math.floor(Math.random() * postIds.length)],
          collection_id: collection.id,
        });
      }
      await bookmarkRepo.save(bookmarksData);

      const feedsData = [];
      for (let i = 0; i < 500; i++) {
        feedsData.push({
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          actor_id: userIds[Math.floor(Math.random() * userIds.length)],
          entity_id: postIds[Math.floor(Math.random() * postIds.length)],
          entity_type: FeedEntityType.POST,
          score: 1.0,
        });
      }
      await feedRepo.save(feedsData);

      // ==========================================
      // SECTION 9: MESSAGING & WEBSOCKET
      // ==========================================
      this.logger.log('Generating messaging data...');
      const convRepo = this.dataSource.getRepository(Conversation);
      const cpRepo = this.dataSource.getRepository(ConversationParticipant);
      const msgRepo = this.dataSource.getRepository(Message);
      const msgReaRepo = this.dataSource.getRepository(MessageReaction);

      const convsData = [];
      for (let i = 0; i < 50; i++) {
        convsData.push({
          id: faker.string.uuid(),
          type: ConversationType.DIRECT,
          created_by: userIds[Math.floor(Math.random() * userIds.length)],
        });
      }
      await convRepo.save(convsData);

      const participantsData = [];
      const messagesData = [];
      for (const conv of convsData) {
        const u1 = userIds[Math.floor(Math.random() * userIds.length)];
        let u2 = userIds[Math.floor(Math.random() * userIds.length)];
        while (u1 === u2) {
          u2 = userIds[Math.floor(Math.random() * userIds.length)];
        }

        participantsData.push(
          { conversation_id: conv.id, user_id: u1 },
          { conversation_id: conv.id, user_id: u2 },
        );

        messagesData.push({
          id: faker.string.uuid(),
          conversation_id: conv.id,
          sender_id: u1,
          content: `Hello, random message text!`,
          type: MessageType.TEXT,
        });
      }
      await cpRepo.save(participantsData);
      await msgRepo.save(messagesData);

      const msgReactionsData = [];
      for (const msg of messagesData) {
        msgReactionsData.push({
          message_id: msg.id,
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          emoji: 'heart',
        });
      }
      await msgReaRepo.save(msgReactionsData);

      // ==========================================
      // SECTION 10: NOTIFICATIONS & SYSTEM LOGS
      // ==========================================
      this.logger.log('Generating notifications and system logs...');
      const notiRepo = this.dataSource.getRepository(Notification);
      const notiPrefRepo = this.dataSource.getRepository(
        NotificationPreference,
      );
      const pushRepo = this.dataSource.getRepository(PushToken);
      const refreshRepo = this.dataSource.getRepository(RefreshToken);
      const reportRepo = this.dataSource.getRepository(Report);
      const auditRepo = this.dataSource.getRepository(AuditLog);
      const seoRepo = this.dataSource.getRepository(SeoMeta);

      const notisData = [];
      const notiPrefsData = [];
      const pushTokensData = [];
      const refreshTokensData = [];
      const reportsData = [];
      const auditLogsData = [];

      for (let i = 0; i < 100; i++) {
        const uId = userIds[i];
        notisData.push({
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          actor_id: uId,
          type: 'NEW_MESSAGE',
          payload: { message: 'A notification' },
        });
        notiPrefsData.push({
          user_id: uId,
          notification_type: 'NEW_MESSAGE',
          via_push: true,
          via_email: true,
          via_websocket: true,
        });
        pushTokensData.push({
          user_id: uId,
          token: `FCM-TOKEN-${i}-${faker.string.alphanumeric(8)}`,
          platform: PushPlatform.WEB,
        });
        refreshTokensData.push({
          user_id: uId,
          token_hash: `REFRESH-HASH-${i}-${faker.string.alphanumeric(8)}`,
          expires_at: new Date(Date.now() + 86400000),
        });
        reportsData.push({
          reporter_id: uId,
          target_type: ReportTargetType.USER,
          target_id: userIds[Math.floor(Math.random() * userIds.length)],
          reason: 'Spam',
        });
        auditLogsData.push({
          user_id: uId,
          action: 'LOGIN',
          entity: 'User',
          entity_id: uId,
        });
      }

      await notiRepo.save(notisData);
      await notiPrefRepo.save(notiPrefsData);
      await pushRepo.save(pushTokensData);
      await refreshRepo.save(refreshTokensData);
      await reportRepo.save(reportsData);
      await auditRepo.save(auditLogsData);

      await seoRepo.save({
        meta_title: 'How to seed DB',
        meta_description: 'A guide on seeding databases',
      });

      this.logger.log(
        'Database seed for ALL 57 entities completed successfully!',
      );
    } catch (error) {
      this.logger.error('Error seeding database: ', error.stack);
    } finally {
      await queryRunner.release();
    }
  }
}
