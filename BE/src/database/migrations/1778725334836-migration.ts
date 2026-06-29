import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1778725334836 implements MigrationInterface {
  name = 'Migration1778725334836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`seo_meta\` (\`id\` varchar(36) NOT NULL, \`meta_title\` varchar(255) NULL, \`meta_description\` text NULL, \`meta_keywords\` varchar(500) NULL, \`og_title\` varchar(255) NULL, \`og_description\` text NULL, \`og_image\` varchar(1000) NULL, \`canonical_url\` varchar(1000) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`categories\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` text NULL, \`parent_id\` varchar(255) NULL, \`seo_meta_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_420d9f679d41281f282f5bc7d0\` (\`slug\`), UNIQUE INDEX \`REL_221970c565d084e2a5e9047ece\` (\`seo_meta_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`article_versions\` (\`id\` varchar(36) NOT NULL, \`article_id\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`excerpt\` text NULL, \`status\` enum ('draft', 'review', 'approved', 'rejected') NOT NULL, \`created_by\` varchar(255) NOT NULL, \`reviewed_by\` varchar(255) NULL, \`review_note\` varchar(1000) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`article_assets\` (\`id\` varchar(36) NOT NULL, \`article_id\` varchar(255) NOT NULL, \`file_url\` varchar(1000) NOT NULL, \`file_type\` enum ('image', 'video', 'document') NOT NULL, \`size_bytes\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tags\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`slug\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_d90243459a697eadb8ad56e909\` (\`name\`), UNIQUE INDEX \`IDX_b3aa10c29ea4e61a830362bd25\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`article_tags\` (\`article_id\` varchar(255) NOT NULL, \`tag_id\` varchar(255) NOT NULL, PRIMARY KEY (\`article_id\`, \`tag_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`page_admins\` (\`page_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`role\` enum ('admin', 'editor', 'moderator', 'advertiser', 'analyst') NOT NULL, \`added_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`page_id\`, \`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`pages\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`category\` varchar(100) NOT NULL, \`description\` text NULL, \`avatar_url\` varchar(500) NULL, \`cover_url\` varchar(500) NULL, \`website\` varchar(500) NULL, \`phone\` varchar(50) NULL, \`email\` varchar(255) NULL, \`address\` varchar(500) NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`follower_count\` int NOT NULL DEFAULT '0', \`created_by\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9908d8a7a8a55aee3ec2638d77\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`group_members\` (\`group_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`role\` enum ('admin', 'moderator', 'member') NOT NULL DEFAULT 'member', \`status\` enum ('active', 'pending', 'banned') NOT NULL DEFAULT 'active', \`invited_by\` varchar(255) NULL, \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`group_id\`, \`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`group_rules\` (\`id\` varchar(36) NOT NULL, \`group_id\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`sort_order\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`groups\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` text NULL, \`avatar_url\` varchar(500) NULL, \`cover_url\` varchar(500) NULL, \`privacy\` enum ('public', 'closed', 'secret') NOT NULL, \`type\` enum ('general', 'buy_sell', 'gaming', 'parenting', 'travel', 'other') NOT NULL DEFAULT 'general', \`member_count\` int NOT NULL DEFAULT '0', \`post_count\` int NOT NULL DEFAULT '0', \`created_by\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_eccfe767267171ae21e7cbf183\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`post_media\` (\`id\` varchar(36) NOT NULL, \`post_id\` varchar(255) NOT NULL, \`file_url\` varchar(1000) NOT NULL, \`thumbnail_url\` varchar(1000) NULL, \`type\` enum ('image', 'video', 'reel', 'gif') NOT NULL, \`width\` int NULL, \`height\` int NULL, \`duration_seconds\` int NULL, \`alt_text\` varchar(500) NULL, \`sort_order\` int NOT NULL DEFAULT '0', \`size_bytes\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`post_tags\` (\`post_id\` varchar(255) NOT NULL, \`tagged_user_id\` varchar(255) NOT NULL, \`approved_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`post_id\`, \`tagged_user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`poll_votes\` (\`poll_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`option_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`poll_id\`, \`user_id\`, \`option_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`poll_options\` (\`id\` varchar(36) NOT NULL, \`poll_id\` varchar(255) NOT NULL, \`option_text\` varchar(255) NOT NULL, \`vote_count\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`polls\` (\`id\` varchar(36) NOT NULL, \`post_id\` varchar(255) NOT NULL, \`question\` varchar(500) NOT NULL, \`allow_multiple\` tinyint NOT NULL DEFAULT 0, \`expires_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`posts\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`page_id\` varchar(255) NULL, \`group_id\` varchar(255) NULL, \`content\` text NULL, \`type\` enum ('text', 'photo', 'video', 'link', 'feeling', 'check_in', 'memory', 'poll', 'reel') NOT NULL DEFAULT 'text', \`audience\` enum ('public', 'friends', 'friends_of_friends', 'only_me', 'custom') NOT NULL, \`custom_audience_ids\` json NULL, \`feeling\` varchar(255) NULL, \`location_name\` varchar(255) NULL, \`location_lat\` decimal(10,8) NULL, \`location_lng\` decimal(11,8) NULL, \`link_url\` varchar(1000) NULL, \`link_title\` varchar(255) NULL, \`link_description\` text NULL, \`link_image\` varchar(1000) NULL, \`parent_post_id\` varchar(255) NULL, \`is_pinned\` tinyint NOT NULL DEFAULT 0, \`is_hidden\` tinyint NOT NULL DEFAULT 0, \`comment_disabled\` tinyint NOT NULL DEFAULT 0, \`view_count\` int NOT NULL DEFAULT '0', \`share_count\` int NOT NULL DEFAULT '0', \`reaction_count\` int NOT NULL DEFAULT '0', \`comment_count\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`post_hashtags\` (\`post_id\` varchar(255) NOT NULL, \`hashtag_id\` varchar(255) NOT NULL, PRIMARY KEY (\`post_id\`, \`hashtag_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`hashtags\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`trending_score\` float NOT NULL DEFAULT '0', \`usage_count\` int NOT NULL DEFAULT '0', \`last_used_at\` datetime NULL, UNIQUE INDEX \`IDX_7fedde18872deb14e4889361d7\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`article_hashtags\` (\`article_id\` varchar(255) NOT NULL, \`hashtag_id\` varchar(255) NOT NULL, PRIMARY KEY (\`article_id\`, \`hashtag_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`articles\` (\`id\` varchar(36) NOT NULL, \`slug\` varchar(255) NOT NULL, \`author_id\` varchar(255) NOT NULL, \`category_id\` varchar(255) NULL, \`current_version_id\` varchar(255) NULL, \`seo_meta_id\` varchar(255) NULL, \`status\` enum ('draft', 'review', 'published', 'archived') NOT NULL, \`published_at\` datetime NULL, \`view_count\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` (\`slug\`), UNIQUE INDEX \`REL_043de8fa70915c772bf187af9a\` (\`current_version_id\`), UNIQUE INDEX \`REL_6ec150d9bf79161f342ec06875\` (\`seo_meta_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`comments\` (\`id\` varchar(36) NOT NULL, \`target_type\` enum ('post', 'article', 'photo') NOT NULL, \`target_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`parent_id\` varchar(255) NULL, \`content\` text NULL, \`sticker_url\` varchar(1000) NULL, \`media_url\` varchar(1000) NULL, \`reaction_count\` int NOT NULL DEFAULT '0', \`reply_count\` int NOT NULL DEFAULT '0', \`is_hidden\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notifications\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`actor_id\` varchar(255) NOT NULL, \`type\` varchar(100) NOT NULL, \`payload\` json NOT NULL, \`read_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`profiles\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`avatar_url\` varchar(500) NULL, \`cover_url\` varchar(500) NULL, \`bio\` varchar(255) NULL, \`gender\` enum ('male', 'female', 'custom', 'undisclosed') NULL, \`date_of_birth\` date NULL, \`location_city\` varchar(255) NULL, \`location_country\` varchar(255) NULL, \`website\` varchar(500) NULL, \`relationship_status\` enum ('single', 'in_relationship', 'engaged', 'married', 'complicated', 'separated', 'divorced', 'widowed', 'undisclosed') NULL, \`work\` json NULL, \`education\` json NULL, \`language\` varchar(10) NOT NULL DEFAULT 'vi', \`timezone\` varchar(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh', \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d1ea35db5be7c08520d70dc03f\` (\`username\`), UNIQUE INDEX \`REL_9e432b7df0d182f8d292902d1a\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`reactions\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`target_type\` enum ('post', 'comment', 'message', 'story') NOT NULL, \`target_id\` varchar(255) NOT NULL, \`type\` enum ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry') NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_85bbe9446d3a5d618704488b1e\` (\`user_id\`, \`target_type\`, \`target_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`refresh_tokens\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`token_hash\` varchar(500) NOT NULL, \`expires_at\` datetime NOT NULL, \`revoked_at\` datetime NULL, \`device_info\` varchar(255) NULL, \`ip_address\` varchar(45) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a7838d2ba25be1342091b6695f\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`story_views\` (\`story_id\` varchar(255) NOT NULL, \`viewer_id\` varchar(255) NOT NULL, \`viewed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`story_id\`, \`viewer_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`stories\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`page_id\` varchar(255) NULL, \`type\` enum ('photo', 'video', 'text', 'boomerang') NOT NULL, \`media_url\` varchar(1000) NULL, \`thumbnail_url\` varchar(1000) NULL, \`text_content\` text NULL, \`background_color\` varchar(20) NULL, \`duration_seconds\` int NOT NULL DEFAULT '5', \`audience\` enum ('public', 'friends', 'custom') NOT NULL DEFAULT 'friends', \`expires_at\` datetime NOT NULL, \`view_count\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_presence\` (\`user_id\` varchar(255) NOT NULL, \`status\` enum ('online', 'away', 'busy', 'offline') NOT NULL DEFAULT 'offline', \`custom_status\` varchar(255) NULL, \`last_seen_at\` datetime NOT NULL, \`is_invisible\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`permissions\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(100) NOT NULL, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_8dad765629e83229da6feda1c1\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`role_permissions\` (\`role_id\` varchar(255) NOT NULL, \`permission_id\` varchar(255) NOT NULL, PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_roles\` (\`user_id\` varchar(255) NOT NULL, \`role_id\` varchar(255) NOT NULL, PRIMARY KEY (\`user_id\`, \`role_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_settings\` (\`user_id\` varchar(255) NOT NULL, \`post_default_audience\` enum ('public', 'friends', 'friends_of_friends', 'only_me', 'custom') NOT NULL DEFAULT 'friends', \`profile_visibility\` enum ('public', 'friends', 'only_me') NOT NULL DEFAULT 'friends', \`friend_list_visibility\` enum ('public', 'friends', 'only_me') NOT NULL DEFAULT 'friends', \`following_list_visibility\` enum ('public', 'friends', 'only_me') NOT NULL DEFAULT 'friends', \`tag_review_enabled\` tinyint NOT NULL DEFAULT 1, \`timeline_review_enabled\` tinyint NOT NULL DEFAULT 0, \`face_recognition_enabled\` tinyint NOT NULL DEFAULT 0, \`two_factor_enabled\` tinyint NOT NULL DEFAULT 0, \`two_factor_method\` enum ('sms', 'authenticator') NULL, \`ad_personalization\` tinyint NOT NULL DEFAULT 1, \`data_download_requested_at\` datetime NULL, \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_stats\` (\`user_id\` varchar(255) NOT NULL, \`friend_count\` int NOT NULL DEFAULT '0', \`follower_count\` int NOT NULL DEFAULT '0', \`following_count\` int NOT NULL DEFAULT '0', \`post_count\` int NOT NULL DEFAULT '0', \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive', 'banned', 'memorialized') NOT NULL DEFAULT 'inactive', \`email_verified_at\` datetime NULL, \`phone_verified_at\` datetime NULL, \`last_login_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ws_connections\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`socket_id\` varchar(255) NOT NULL, \`server_id\` varchar(255) NOT NULL, \`device_type\` enum ('web', 'ios', 'android') NOT NULL, \`last_ping_at\` datetime NOT NULL, \`connected_at\` datetime NOT NULL, UNIQUE INDEX \`IDX_b84c7743b69783ceabc65b5592\` (\`socket_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`shares\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`post_id\` varchar(255) NOT NULL, \`shared_to_type\` enum ('timeline', 'group', 'page', 'message', 'external') NOT NULL, \`shared_to_id\` varchar(255) NULL, \`caption\` text NULL, \`audience\` enum ('public', 'friends', 'only_me') NOT NULL DEFAULT 'friends', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`reports\` (\`id\` varchar(36) NOT NULL, \`reporter_id\` varchar(255) NOT NULL, \`target_type\` enum ('post', 'comment', 'user', 'group', 'page', 'marketplace_listing') NOT NULL, \`target_id\` varchar(255) NOT NULL, \`reason\` varchar(1000) NOT NULL, \`status\` enum ('pending', 'reviewed', 'dismissed') NOT NULL DEFAULT 'pending', \`reviewed_by\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`push_tokens\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`token\` varchar(500) NOT NULL, \`platform\` enum ('fcm', 'apns', 'web') NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`last_used_at\` datetime NULL, UNIQUE INDEX \`IDX_869b4a9ba2c9e030aafc4b7dc7\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification_preferences\` (\`user_id\` varchar(255) NOT NULL, \`notification_type\` varchar(100) NOT NULL, \`via_push\` tinyint NOT NULL DEFAULT 1, \`via_email\` tinyint NOT NULL DEFAULT 1, \`via_websocket\` tinyint NOT NULL DEFAULT 1, \`quiet_hours_start\` time NULL, \`quiet_hours_end\` time NULL, PRIMARY KEY (\`user_id\`, \`notification_type\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`conversation_participants\` (\`conversation_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`role\` enum ('admin', 'member') NOT NULL DEFAULT 'member', \`last_read_message_id\` varchar(255) NULL, \`is_muted\` tinyint NOT NULL DEFAULT 0, \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`conversation_id\`, \`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`conversations\` (\`id\` varchar(36) NOT NULL, \`type\` enum ('direct', 'private', 'group', 'marketplace') NOT NULL, \`name\` varchar(255) NULL, \`avatar_url\` varchar(500) NULL, \`theme_color\` varchar(20) NULL, \`emoji\` varchar(20) NULL, \`last_message_id\` varchar(255) NULL, \`created_by\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_a53679287450d522a3f700088e\` (\`last_message_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`messages\` (\`id\` varchar(36) NOT NULL, \`conversation_id\` varchar(255) NOT NULL, \`sender_id\` varchar(255) NOT NULL, \`reply_to_id\` varchar(255) NULL, \`content\` text NULL, \`type\` enum ('text', 'image', 'file', 'sticker', 'voice', 'video_call_log', 'system') NOT NULL DEFAULT 'text', \`edited_at\` datetime NULL, \`deleted_at\` datetime(6) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`message_reactions\` (\`message_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`emoji\` varchar(50) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`message_id\`, \`user_id\`, \`emoji\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`listing_inquiries\` (\`id\` varchar(36) NOT NULL, \`listing_id\` varchar(255) NOT NULL, \`buyer_id\` varchar(255) NOT NULL, \`conversation_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`listings\` (\`id\` varchar(36) NOT NULL, \`seller_id\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`price\` decimal(12,2) NOT NULL, \`currency\` varchar(10) NOT NULL DEFAULT 'VND', \`condition\` enum ('new', 'like_new', 'good', 'fair') NOT NULL, \`category\` varchar(100) NOT NULL, \`status\` enum ('active', 'sold', 'hidden', 'deleted') NOT NULL DEFAULT 'active', \`location_name\` varchar(255) NULL, \`location_lat\` decimal(10,8) NULL, \`location_lng\` decimal(11,8) NULL, \`view_count\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`listing_media\` (\`id\` varchar(36) NOT NULL, \`listing_id\` varchar(255) NOT NULL, \`file_url\` varchar(1000) NOT NULL, \`sort_order\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`friend_requests\` (\`id\` varchar(36) NOT NULL, \`sender_id\` varchar(255) NOT NULL, \`receiver_id\` varchar(255) NOT NULL, \`status\` enum ('pending', 'accepted', 'declined', 'cancelled') NOT NULL DEFAULT 'pending', \`message\` varchar(500) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`responded_at\` datetime NULL, UNIQUE INDEX \`IDX_4c33ef2d7043d4b1b3142a4985\` (\`sender_id\`, \`receiver_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`friends\` (\`user_id\` varchar(255) NOT NULL, \`friend_id\` varchar(255) NOT NULL, \`list_type\` enum ('close_friends', 'acquaintances', 'restricted', 'none') NOT NULL DEFAULT 'none', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`, \`friend_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`follows\` (\`follower_id\` varchar(255) NOT NULL, \`following_type\` enum ('user', 'page', 'group') NOT NULL, \`following_entity_id\` varchar(255) NOT NULL, \`priority\` enum ('default', 'favorites', 'unfollow') NOT NULL DEFAULT 'default', \`status\` enum ('active', 'pending') NOT NULL DEFAULT 'active', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`follower_id\`, \`following_type\`, \`following_entity_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`feeds\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`actor_id\` varchar(255) NOT NULL, \`entity_type\` enum ('post', 'story', 'article', 'follow', 'reaction', 'comment', 'share') NOT NULL, \`entity_id\` varchar(255) NOT NULL, \`score\` float NOT NULL DEFAULT '1', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`bookmarks\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`target_type\` enum ('post', 'article') NOT NULL, \`target_id\` varchar(255) NOT NULL, \`collection_id\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_2ed48048628221ac7889bed40b\` (\`user_id\`, \`target_type\`, \`target_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`bookmark_collections\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`blocks\` (\`blocker_id\` varchar(255) NOT NULL, \`blocked_id\` varchar(255) NOT NULL, \`reason\` varchar(500) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`blocker_id\`, \`blocked_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`audit_logs\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`action\` varchar(255) NOT NULL, \`entity\` varchar(255) NOT NULL, \`entity_id\` varchar(255) NOT NULL, \`old_value\` json NULL, \`new_value\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_88cea2dc9c31951d06437879b40\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_221970c565d084e2a5e9047eced\` FOREIGN KEY (\`seo_meta_id\`) REFERENCES \`seo_meta\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_versions\` ADD CONSTRAINT \`FK_6f13230b812dda9b137e00edff7\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_versions\` ADD CONSTRAINT \`FK_6a1fc3e9d4dd0f6d38035ff6c7f\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_versions\` ADD CONSTRAINT \`FK_bba4d6403bc572ae86339de0dcb\` FOREIGN KEY (\`reviewed_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_assets\` ADD CONSTRAINT \`FK_c184a06a697206bd619a25a84e6\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_tags\` ADD CONSTRAINT \`FK_f8c9234a4c4cb37806387f0c9e9\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_tags\` ADD CONSTRAINT \`FK_1325dd0b98ee0f8f673db6ce194\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`page_admins\` ADD CONSTRAINT \`FK_d169ef9f1e211c0010227213852\` FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`page_admins\` ADD CONSTRAINT \`FK_c91cd35bc409f75f449871aa345\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`pages\` ADD CONSTRAINT \`FK_064ab67bb29a28d073db287fc6d\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members\` ADD CONSTRAINT \`FK_2c840df5db52dc6b4a1b0b69c6e\` FOREIGN KEY (\`group_id\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members\` ADD CONSTRAINT \`FK_20a555b299f75843aa53ff8b0ee\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members\` ADD CONSTRAINT \`FK_05b832dc111f99f49f8edbc6560\` FOREIGN KEY (\`invited_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_rules\` ADD CONSTRAINT \`FK_082605f8ac7c874e0e67f28cc23\` FOREIGN KEY (\`group_id\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groups\` ADD CONSTRAINT \`FK_a2fa29bfd5351b5b7ccacbc9f7c\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_media\` ADD CONSTRAINT \`FK_1eeb54a4fdfbe9db17899243cbe\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_tags\` ADD CONSTRAINT \`FK_5df4e8dc2cb3e668b962362265d\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_tags\` ADD CONSTRAINT \`FK_11b1fd0790fe806caa34b669a71\` FOREIGN KEY (\`tagged_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`poll_votes\` ADD CONSTRAINT \`FK_ba03ab00c027c6499e7ddc73404\` FOREIGN KEY (\`poll_id\`) REFERENCES \`polls\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`poll_votes\` ADD CONSTRAINT \`FK_ad381571393d520e921beaf1fee\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`poll_votes\` ADD CONSTRAINT \`FK_433367a9fe86d90e66637310b65\` FOREIGN KEY (\`option_id\`) REFERENCES \`poll_options\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`poll_options\` ADD CONSTRAINT \`FK_c00cc693afceae746fa82c0a558\` FOREIGN KEY (\`poll_id\`) REFERENCES \`polls\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`polls\` ADD CONSTRAINT \`FK_91474fbc21eaecda25c2d9a19eb\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_c4f9a7bd77b489e711277ee5986\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_e7345493e9a4c90168c0ea5962a\` FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_7628aa3741a30d6217271a226cf\` FOREIGN KEY (\`group_id\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_979fb4c9d38af5cb74829ab9a4f\` FOREIGN KEY (\`parent_post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_hashtags\` ADD CONSTRAINT \`FK_6c16a0f366b0642259bbe50481c\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_hashtags\` ADD CONSTRAINT \`FK_41f5ee7a97e67023d7461fa8f43\` FOREIGN KEY (\`hashtag_id\`) REFERENCES \`hashtags\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_hashtags\` ADD CONSTRAINT \`FK_bf6f5f75c5a76b678bb5a38f9dc\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_hashtags\` ADD CONSTRAINT \`FK_c2170b4ec2bc6057745b512e207\` FOREIGN KEY (\`hashtag_id\`) REFERENCES \`hashtags\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`articles\` ADD CONSTRAINT \`FK_6515da4dff8db423ce4eb841490\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`articles\` ADD CONSTRAINT \`FK_e025eeefcdb2a269c42484ee43f\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`articles\` ADD CONSTRAINT \`FK_043de8fa70915c772bf187af9a3\` FOREIGN KEY (\`current_version_id\`) REFERENCES \`article_versions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`articles\` ADD CONSTRAINT \`FK_6ec150d9bf79161f342ec068752\` FOREIGN KEY (\`seo_meta_id\`) REFERENCES \`seo_meta\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_4c675567d2a58f0b07cef09c13d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_d6f93329801a93536da4241e386\` FOREIGN KEY (\`parent_id\`) REFERENCES \`comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_9a8a82462cab47c73d25f49261f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_20f8b51fd9655c0b69feed5efc6\` FOREIGN KEY (\`actor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profiles\` ADD CONSTRAINT \`FK_9e432b7df0d182f8d292902d1a2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reactions\` ADD CONSTRAINT \`FK_dde6062145a93649adc5af3946e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_3ddc983c5f7bcf132fd8732c3f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_views\` ADD CONSTRAINT \`FK_e30910f5c5e7cefc96f92d17331\` FOREIGN KEY (\`story_id\`) REFERENCES \`stories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_views\` ADD CONSTRAINT \`FK_f213043b37f8aa8ea54b1b262ce\` FOREIGN KEY (\`viewer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stories\` ADD CONSTRAINT \`FK_ab4ee230faf536e7c5aee12f4ea\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stories\` ADD CONSTRAINT \`FK_49594a63a37dc4bf9c5fc1b8750\` FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_presence\` ADD CONSTRAINT \`FK_43f028b293e5eb2fba96d8d5841\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_settings\` ADD CONSTRAINT \`FK_4ed056b9344e6f7d8d46ec4b302\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stats\` ADD CONSTRAINT \`FK_0e0da843088caf61925ded4434e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ws_connections\` ADD CONSTRAINT \`FK_0b0c39a306971b7c3bc376fc195\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shares\` ADD CONSTRAINT \`FK_a8aded2f90f448876f7fe63eab4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shares\` ADD CONSTRAINT \`FK_876fddcf3965fbcd1dd78a4b283\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_9459b9bf907a3807ef7143d2ead\` FOREIGN KEY (\`reporter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_e8fa0bffcaebc921b1e8e42a82f\` FOREIGN KEY (\`reviewed_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`push_tokens\` ADD CONSTRAINT \`FK_94c371aff70dedeb89dae39f440\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_preferences\` ADD CONSTRAINT \`FK_64c90edc7310c6be7c10c96f675\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD CONSTRAINT \`FK_1559e8a16b828f2e836a2312800\` FOREIGN KEY (\`conversation_id\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD CONSTRAINT \`FK_377d4041a495b81ee1a85ae026f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD CONSTRAINT \`FK_6cb944b185d650d33d9b5ee1bb1\` FOREIGN KEY (\`last_read_message_id\`) REFERENCES \`messages\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_81d92d15c62b3fff79c617c9043\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_a53679287450d522a3f700088e9\` FOREIGN KEY (\`last_message_id\`) REFERENCES \`messages\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_3bc55a7c3f9ed54b520bb5cfe23\` FOREIGN KEY (\`conversation_id\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_22133395bd13b970ccd0c34ab22\` FOREIGN KEY (\`sender_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_54e66104dd534ed1c191e44096f\` FOREIGN KEY (\`reply_to_id\`) REFERENCES \`messages\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`message_reactions\` ADD CONSTRAINT \`FK_ce61e365d81a9dfc15cd36513b0\` FOREIGN KEY (\`message_id\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`message_reactions\` ADD CONSTRAINT \`FK_b6d3eda2f99b64016d6a4cf112f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`listing_inquiries\` ADD CONSTRAINT \`FK_ae9e4550863b0683e90a8dadd60\` FOREIGN KEY (\`listing_id\`) REFERENCES \`listings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`listing_inquiries\` ADD CONSTRAINT \`FK_59cfcef9c49d1c1bfccb47c6fb0\` FOREIGN KEY (\`buyer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`listing_inquiries\` ADD CONSTRAINT \`FK_fa9e108ad27d8167900f1c035f3\` FOREIGN KEY (\`conversation_id\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`listings\` ADD CONSTRAINT \`FK_6d2846ee6b337ce5225c8c7286b\` FOREIGN KEY (\`seller_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`listing_media\` ADD CONSTRAINT \`FK_d6e41836cd0907f44729c12285e\` FOREIGN KEY (\`listing_id\`) REFERENCES \`listings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_requests\` ADD CONSTRAINT \`FK_c034dd387df6cd4ce9aaebdd480\` FOREIGN KEY (\`sender_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_requests\` ADD CONSTRAINT \`FK_781744f1014838837741581a8b7\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friends\` ADD CONSTRAINT \`FK_f2534e418d51fa6e5e8cdd4b480\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friends\` ADD CONSTRAINT \`FK_c9d447f72456a67d17ec30c5d00\` FOREIGN KEY (\`friend_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` ADD CONSTRAINT \`FK_54b5dc2739f2dea57900933db66\` FOREIGN KEY (\`follower_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`feeds\` ADD CONSTRAINT \`FK_ca81f22ea67d9df1257df35afb9\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`feeds\` ADD CONSTRAINT \`FK_129d20e55e148f42f2ebeba9dc8\` FOREIGN KEY (\`actor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bookmarks\` ADD CONSTRAINT \`FK_58a0fbaee65cd8959a870ee678c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bookmarks\` ADD CONSTRAINT \`FK_a1b840793b5b340df3ebb1b47d8\` FOREIGN KEY (\`collection_id\`) REFERENCES \`bookmark_collections\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bookmark_collections\` ADD CONSTRAINT \`FK_9945e3cb3b246112799832107d1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD CONSTRAINT \`FK_74f530c6fbffc357047b263818d\` FOREIGN KEY (\`blocker_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD CONSTRAINT \`FK_8aa6c887bed61ad10829450f2f0\` FOREIGN KEY (\`blocked_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_bd2726fd31b35443f2245b93ba0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` DROP FOREIGN KEY \`FK_8aa6c887bed61ad10829450f2f0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` DROP FOREIGN KEY \`FK_74f530c6fbffc357047b263818d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bookmark_collections\` DROP FOREIGN KEY \`FK_9945e3cb3b246112799832107d1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bookmarks\` DROP FOREIGN KEY \`FK_a1b840793b5b340df3ebb1b47d8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bookmarks\` DROP FOREIGN KEY \`FK_58a0fbaee65cd8959a870ee678c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`feeds\` DROP FOREIGN KEY \`FK_129d20e55e148f42f2ebeba9dc8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`feeds\` DROP FOREIGN KEY \`FK_ca81f22ea67d9df1257df35afb9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` DROP FOREIGN KEY \`FK_54b5dc2739f2dea57900933db66\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`friends\` DROP FOREIGN KEY \`FK_c9d447f72456a67d17ec30c5d00\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`friends\` DROP FOREIGN KEY \`FK_f2534e418d51fa6e5e8cdd4b480\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_requests\` DROP FOREIGN KEY \`FK_781744f1014838837741581a8b7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_requests\` DROP FOREIGN KEY \`FK_c034dd387df6cd4ce9aaebdd480\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`listing_media\` DROP FOREIGN KEY \`FK_d6e41836cd0907f44729c12285e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`listings\` DROP FOREIGN KEY \`FK_6d2846ee6b337ce5225c8c7286b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`listing_inquiries\` DROP FOREIGN KEY \`FK_fa9e108ad27d8167900f1c035f3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`listing_inquiries\` DROP FOREIGN KEY \`FK_59cfcef9c49d1c1bfccb47c6fb0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`listing_inquiries\` DROP FOREIGN KEY \`FK_ae9e4550863b0683e90a8dadd60\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`message_reactions\` DROP FOREIGN KEY \`FK_b6d3eda2f99b64016d6a4cf112f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`message_reactions\` DROP FOREIGN KEY \`FK_ce61e365d81a9dfc15cd36513b0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_54e66104dd534ed1c191e44096f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_22133395bd13b970ccd0c34ab22\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_3bc55a7c3f9ed54b520bb5cfe23\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_a53679287450d522a3f700088e9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_81d92d15c62b3fff79c617c9043\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP FOREIGN KEY \`FK_6cb944b185d650d33d9b5ee1bb1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP FOREIGN KEY \`FK_377d4041a495b81ee1a85ae026f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP FOREIGN KEY \`FK_1559e8a16b828f2e836a2312800\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_preferences\` DROP FOREIGN KEY \`FK_64c90edc7310c6be7c10c96f675\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`push_tokens\` DROP FOREIGN KEY \`FK_94c371aff70dedeb89dae39f440\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_e8fa0bffcaebc921b1e8e42a82f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_9459b9bf907a3807ef7143d2ead\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shares\` DROP FOREIGN KEY \`FK_876fddcf3965fbcd1dd78a4b283\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shares\` DROP FOREIGN KEY \`FK_a8aded2f90f448876f7fe63eab4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ws_connections\` DROP FOREIGN KEY \`FK_0b0c39a306971b7c3bc376fc195\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stats\` DROP FOREIGN KEY \`FK_0e0da843088caf61925ded4434e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_settings\` DROP FOREIGN KEY \`FK_4ed056b9344e6f7d8d46ec4b302\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_presence\` DROP FOREIGN KEY \`FK_43f028b293e5eb2fba96d8d5841\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stories\` DROP FOREIGN KEY \`FK_49594a63a37dc4bf9c5fc1b8750\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stories\` DROP FOREIGN KEY \`FK_ab4ee230faf536e7c5aee12f4ea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_views\` DROP FOREIGN KEY \`FK_f213043b37f8aa8ea54b1b262ce\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_views\` DROP FOREIGN KEY \`FK_e30910f5c5e7cefc96f92d17331\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_3ddc983c5f7bcf132fd8732c3f4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reactions\` DROP FOREIGN KEY \`FK_dde6062145a93649adc5af3946e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_9e432b7df0d182f8d292902d1a2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_20f8b51fd9655c0b69feed5efc6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_9a8a82462cab47c73d25f49261f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_d6f93329801a93536da4241e386\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4c675567d2a58f0b07cef09c13d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_6ec150d9bf79161f342ec068752\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_043de8fa70915c772bf187af9a3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_e025eeefcdb2a269c42484ee43f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_6515da4dff8db423ce4eb841490\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_hashtags\` DROP FOREIGN KEY \`FK_c2170b4ec2bc6057745b512e207\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_hashtags\` DROP FOREIGN KEY \`FK_bf6f5f75c5a76b678bb5a38f9dc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_hashtags\` DROP FOREIGN KEY \`FK_41f5ee7a97e67023d7461fa8f43\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_hashtags\` DROP FOREIGN KEY \`FK_6c16a0f366b0642259bbe50481c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_979fb4c9d38af5cb74829ab9a4f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_7628aa3741a30d6217271a226cf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_e7345493e9a4c90168c0ea5962a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_c4f9a7bd77b489e711277ee5986\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`polls\` DROP FOREIGN KEY \`FK_91474fbc21eaecda25c2d9a19eb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`poll_options\` DROP FOREIGN KEY \`FK_c00cc693afceae746fa82c0a558\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`poll_votes\` DROP FOREIGN KEY \`FK_433367a9fe86d90e66637310b65\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`poll_votes\` DROP FOREIGN KEY \`FK_ad381571393d520e921beaf1fee\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`poll_votes\` DROP FOREIGN KEY \`FK_ba03ab00c027c6499e7ddc73404\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_tags\` DROP FOREIGN KEY \`FK_11b1fd0790fe806caa34b669a71\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_tags\` DROP FOREIGN KEY \`FK_5df4e8dc2cb3e668b962362265d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_media\` DROP FOREIGN KEY \`FK_1eeb54a4fdfbe9db17899243cbe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groups\` DROP FOREIGN KEY \`FK_a2fa29bfd5351b5b7ccacbc9f7c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_rules\` DROP FOREIGN KEY \`FK_082605f8ac7c874e0e67f28cc23\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members\` DROP FOREIGN KEY \`FK_05b832dc111f99f49f8edbc6560\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members\` DROP FOREIGN KEY \`FK_20a555b299f75843aa53ff8b0ee\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members\` DROP FOREIGN KEY \`FK_2c840df5db52dc6b4a1b0b69c6e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`pages\` DROP FOREIGN KEY \`FK_064ab67bb29a28d073db287fc6d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`page_admins\` DROP FOREIGN KEY \`FK_c91cd35bc409f75f449871aa345\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`page_admins\` DROP FOREIGN KEY \`FK_d169ef9f1e211c0010227213852\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_tags\` DROP FOREIGN KEY \`FK_1325dd0b98ee0f8f673db6ce194\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_tags\` DROP FOREIGN KEY \`FK_f8c9234a4c4cb37806387f0c9e9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_assets\` DROP FOREIGN KEY \`FK_c184a06a697206bd619a25a84e6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_versions\` DROP FOREIGN KEY \`FK_bba4d6403bc572ae86339de0dcb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_versions\` DROP FOREIGN KEY \`FK_6a1fc3e9d4dd0f6d38035ff6c7f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`article_versions\` DROP FOREIGN KEY \`FK_6f13230b812dda9b137e00edff7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_221970c565d084e2a5e9047eced\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_88cea2dc9c31951d06437879b40\``,
    );
    await queryRunner.query(`DROP TABLE \`audit_logs\``);
    await queryRunner.query(`DROP TABLE \`blocks\``);
    await queryRunner.query(`DROP TABLE \`bookmark_collections\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_2ed48048628221ac7889bed40b\` ON \`bookmarks\``,
    );
    await queryRunner.query(`DROP TABLE \`bookmarks\``);
    await queryRunner.query(`DROP TABLE \`feeds\``);
    await queryRunner.query(`DROP TABLE \`follows\``);
    await queryRunner.query(`DROP TABLE \`friends\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_4c33ef2d7043d4b1b3142a4985\` ON \`friend_requests\``,
    );
    await queryRunner.query(`DROP TABLE \`friend_requests\``);
    await queryRunner.query(`DROP TABLE \`listing_media\``);
    await queryRunner.query(`DROP TABLE \`listings\``);
    await queryRunner.query(`DROP TABLE \`listing_inquiries\``);
    await queryRunner.query(`DROP TABLE \`message_reactions\``);
    await queryRunner.query(`DROP TABLE \`messages\``);
    await queryRunner.query(
      `DROP INDEX \`REL_a53679287450d522a3f700088e\` ON \`conversations\``,
    );
    await queryRunner.query(`DROP TABLE \`conversations\``);
    await queryRunner.query(`DROP TABLE \`conversation_participants\``);
    await queryRunner.query(`DROP TABLE \`notification_preferences\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_869b4a9ba2c9e030aafc4b7dc7\` ON \`push_tokens\``,
    );
    await queryRunner.query(`DROP TABLE \`push_tokens\``);
    await queryRunner.query(`DROP TABLE \`reports\``);
    await queryRunner.query(`DROP TABLE \`shares\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_b84c7743b69783ceabc65b5592\` ON \`ws_connections\``,
    );
    await queryRunner.query(`DROP TABLE \`ws_connections\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`user_stats\``);
    await queryRunner.query(`DROP TABLE \`user_settings\``);
    await queryRunner.query(`DROP TABLE \`user_roles\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``,
    );
    await queryRunner.query(`DROP TABLE \`roles\``);
    await queryRunner.query(`DROP TABLE \`role_permissions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_8dad765629e83229da6feda1c1\` ON \`permissions\``,
    );
    await queryRunner.query(`DROP TABLE \`permissions\``);
    await queryRunner.query(`DROP TABLE \`user_presence\``);
    await queryRunner.query(`DROP TABLE \`stories\``);
    await queryRunner.query(`DROP TABLE \`story_views\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_a7838d2ba25be1342091b6695f\` ON \`refresh_tokens\``,
    );
    await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_85bbe9446d3a5d618704488b1e\` ON \`reactions\``,
    );
    await queryRunner.query(`DROP TABLE \`reactions\``);
    await queryRunner.query(
      `DROP INDEX \`REL_9e432b7df0d182f8d292902d1a\` ON \`profiles\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d1ea35db5be7c08520d70dc03f\` ON \`profiles\``,
    );
    await queryRunner.query(`DROP TABLE \`profiles\``);
    await queryRunner.query(`DROP TABLE \`notifications\``);
    await queryRunner.query(`DROP TABLE \`comments\``);
    await queryRunner.query(
      `DROP INDEX \`REL_6ec150d9bf79161f342ec06875\` ON \`articles\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_043de8fa70915c772bf187af9a\` ON \`articles\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` ON \`articles\``,
    );
    await queryRunner.query(`DROP TABLE \`articles\``);
    await queryRunner.query(`DROP TABLE \`article_hashtags\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7fedde18872deb14e4889361d7\` ON \`hashtags\``,
    );
    await queryRunner.query(`DROP TABLE \`hashtags\``);
    await queryRunner.query(`DROP TABLE \`post_hashtags\``);
    await queryRunner.query(`DROP TABLE \`posts\``);
    await queryRunner.query(`DROP TABLE \`polls\``);
    await queryRunner.query(`DROP TABLE \`poll_options\``);
    await queryRunner.query(`DROP TABLE \`poll_votes\``);
    await queryRunner.query(`DROP TABLE \`post_tags\``);
    await queryRunner.query(`DROP TABLE \`post_media\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_eccfe767267171ae21e7cbf183\` ON \`groups\``,
    );
    await queryRunner.query(`DROP TABLE \`groups\``);
    await queryRunner.query(`DROP TABLE \`group_rules\``);
    await queryRunner.query(`DROP TABLE \`group_members\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_9908d8a7a8a55aee3ec2638d77\` ON \`pages\``,
    );
    await queryRunner.query(`DROP TABLE \`pages\``);
    await queryRunner.query(`DROP TABLE \`page_admins\``);
    await queryRunner.query(`DROP TABLE \`article_tags\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_b3aa10c29ea4e61a830362bd25\` ON \`tags\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d90243459a697eadb8ad56e909\` ON \`tags\``,
    );
    await queryRunner.query(`DROP TABLE \`tags\``);
    await queryRunner.query(`DROP TABLE \`article_assets\``);
    await queryRunner.query(`DROP TABLE \`article_versions\``);
    await queryRunner.query(
      `DROP INDEX \`REL_221970c565d084e2a5e9047ece\` ON \`categories\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_420d9f679d41281f282f5bc7d0\` ON \`categories\``,
    );
    await queryRunner.query(`DROP TABLE \`categories\``);
    await queryRunner.query(`DROP TABLE \`seo_meta\``);
  }
}
