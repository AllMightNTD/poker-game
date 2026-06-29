import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRecommendationTestData1781000000000 implements MigrationInterface {
  name = 'SeedRecommendationTestData1781000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Get or create a target user to be the anchor for recommendations
    let targetUserId = '';
    const existingUsers = await queryRunner.query(
      'SELECT id FROM users LIMIT 1',
    );

    let createdTarget = false;
    if (existingUsers && existingUsers.length > 0) {
      targetUserId = existingUsers[0].id;
    } else {
      targetUserId = 'test-target-user-uuid';
      createdTarget = true;

      // Clean up target user if it partially exists
      await queryRunner.query(`DELETE FROM profiles WHERE user_id = ?`, [
        targetUserId,
      ]);
      await queryRunner.query(`DELETE FROM users WHERE id = ?`, [targetUserId]);

      await queryRunner.query(
        `
                INSERT INTO users (id, email, password, status, created_at, updated_at)
                VALUES (?, 'rec_target@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'ACTIVE', NOW(), NOW())
            `,
        [targetUserId],
      );

      await queryRunner.query(
        `
                INSERT INTO profiles (id, user_id, full_name, username, avatar_url, location_city, location_country, education, work)
                VALUES ('profile-target-uuid', ?, 'Target User Rec', 'rec_target', ?, 'Hanoi', 'Vietnam', '[]', '[]')
            `,
        [
          targetUserId,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=Target',
        ],
      );
    }

    // Make sure the target user's profile details match what we will compare against
    await queryRunner.query(
      `
            UPDATE profiles 
            SET 
                location_city = 'Hanoi', 
                location_country = 'Vietnam',
                education = '[{"school": "Đại học Bách Khoa", "year": 2018}]',
                work = '[{"company": "Google", "role": "Engineer"}]'
            WHERE user_id = ?
        `,
      [targetUserId],
    );

    // Helper to insert candidate user & profile (deleting existing ones first to prevent duplicates)
    const insertUser = async (
      id: string,
      email: string,
      name: string,
      username: string,
      city = 'Da Nang',
      country = 'Vietnam',
      edu = '[]',
      work = '[]',
    ) => {
      const profileId = `profile-${id}`;
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      await queryRunner.query(`DELETE FROM profiles WHERE user_id = ?`, [id]);
      await queryRunner.query(`DELETE FROM users WHERE id = ?`, [id]);

      await queryRunner.query(
        `
                INSERT INTO users (id, email, password, status, created_at, updated_at)
                VALUES (?, ?, '$2b$10$abcdefghijklmnopqrstuv', 'ACTIVE', NOW(), NOW())
            `,
        [id, email],
      );

      await queryRunner.query(
        `
                INSERT INTO profiles (id, user_id, full_name, username, avatar_url, location_city, location_country, education, work)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [profileId, id, name, username, avatarUrl, city, country, edu, work],
      );
    };

    // --- SEEDING CANDIDATES WITH DIFFERENT SIGNALS ---

    // Clean up connections, groups, posts, tokens of candidates first to prevent duplicates
    const testUserIds = [
      'rec-user-mutual-uuid',
      'rec-friend-1-uuid',
      'rec-friend-2-uuid',
      'rec-friend-3-uuid',
      'rec-user-edu-city-uuid',
      'rec-user-work-group-uuid',
      'rec-user-interaction-uuid',
      'rec-user-network-uuid',
      'rec-user-already-friend-uuid',
      'rec-user-pending-inc-uuid',
      'rec-user-pending-out-uuid',
      'rec-user-blocked-uuid',
    ];

    await queryRunner.query(
      `DELETE FROM blocks WHERE blocker_id IN (?) OR blocked_id IN (?)`,
      [testUserIds, testUserIds],
    );
    await queryRunner.query(
      `DELETE FROM friend_requests WHERE sender_id IN (?) OR receiver_id IN (?) OR id IN ('rec-req-incoming', 'rec-req-outgoing')`,
      [testUserIds, testUserIds],
    );
    await queryRunner.query(
      `DELETE FROM friends WHERE user_id IN (?) OR friend_id IN (?) OR user_id = ? OR friend_id = ?`,
      [testUserIds, testUserIds, targetUserId, targetUserId],
    );
    await queryRunner.query(
      `DELETE FROM refresh_tokens WHERE user_id IN (?) OR id IN ('rec-token-target', 'rec-token-cand')`,
      [testUserIds],
    );
    await queryRunner.query(
      `DELETE FROM comments WHERE target_id = 'rec-test-post-uuid' OR user_id IN (?)`,
      [testUserIds],
    );
    await queryRunner.query(
      `DELETE FROM reactions WHERE target_id = 'rec-test-post-uuid' OR user_id IN (?)`,
      [testUserIds],
    );
    await queryRunner.query(
      `DELETE FROM posts WHERE id = 'rec-test-post-uuid' OR user_id IN (?)`,
      [testUserIds],
    );
    await queryRunner.query(
      `DELETE FROM group_members WHERE group_id = 'rec-test-group-uuid' OR user_id IN (?)`,
      [testUserIds],
    );
    await queryRunner.query(
      `DELETE FROM \`groups\` WHERE id = 'rec-test-group-uuid'`,
    );

    // Signal 1: Mutual Friends Candidate (Highest weight)
    await insertUser(
      'rec-user-mutual-uuid',
      'rec_mutual@example.com',
      'Mutual Friend Candidate',
      'rec_mutual',
    );

    // Connectors (Friends of both target and mutual)
    await insertUser(
      'rec-friend-1-uuid',
      'rec_friend1@example.com',
      'Connector One',
      'rec_friend1',
    );
    await insertUser(
      'rec-friend-2-uuid',
      'rec_friend2@example.com',
      'Connector Two',
      'rec_friend2',
    );
    await insertUser(
      'rec-friend-3-uuid',
      'rec_friend3@example.com',
      'Connector Three',
      'rec_friend3',
    );

    // Target user is friends with Connectors
    for (const fId of [
      'rec-friend-1-uuid',
      'rec-friend-2-uuid',
      'rec-friend-3-uuid',
    ]) {
      await queryRunner.query(
        `INSERT INTO friends (user_id, friend_id, created_at) VALUES (?, ?, NOW()), (?, ?, NOW())`,
        [targetUserId, fId, fId, targetUserId],
      );
    }
    // Mutual Candidate is also friends with Connectors (giving exactly 3 mutual friends)
    for (const fId of [
      'rec-friend-1-uuid',
      'rec-friend-2-uuid',
      'rec-friend-3-uuid',
    ]) {
      await queryRunner.query(
        `INSERT INTO friends (user_id, friend_id, created_at) VALUES ('rec-user-mutual-uuid', ?, NOW()), (?, 'rec-user-mutual-uuid', NOW())`,
        [fId, fId],
      );
    }

    // Signal 2: Same Education & Same City
    await insertUser(
      'rec-user-edu-city-uuid',
      'rec_edu_city@example.com',
      'Edu and City Candidate',
      'rec_edu_city',
      'Hanoi',
      'Vietnam',
      '[{"school": "Đại học Bách Khoa", "year": 2020}]',
      '[]',
    );

    // Signal 3: Same Company & Same Group
    await insertUser(
      'rec-user-work-group-uuid',
      'rec_work_group@example.com',
      'Work and Group Candidate',
      'rec_work_group',
      'Ho Chi Minh',
      'Vietnam',
      '[]',
      '[{"company": "Google", "role": "Senior Engineer"}]',
    );

    // Create the group (groups is a reserved keyword in MySQL 8.0, so must be escaped with backticks)
    await queryRunner.query(
      `
            INSERT INTO \`groups\` (id, name, slug, description, privacy, type, created_by, created_at, updated_at)
            VALUES ('rec-test-group-uuid', 'Social Network Test Group', 'social-network-test-group', 'Testing groups', 'PUBLIC', 'GENERAL', ?, NOW(), NOW())
        `,
      [targetUserId],
    );

    // Join target and Candidate 3 to the group
    await queryRunner.query(
      `
            INSERT INTO group_members (group_id, user_id, role, status, joined_at)
            VALUES 
                ('rec-test-group-uuid', ?, 'ADMIN', 'ACTIVE', NOW()),
                ('rec-test-group-uuid', 'rec-user-work-group-uuid', 'MEMBER', 'ACTIVE', NOW())
        `,
      [targetUserId],
    );

    // Signal 4: Shared Interactions (Comments and Reactions on same post)
    await insertUser(
      'rec-user-interaction-uuid',
      'rec_interaction@example.com',
      'Interaction Candidate',
      'rec_interaction',
    );

    // Create post by target user
    await queryRunner.query(
      `
            INSERT INTO posts (id, user_id, content, audience, type, created_at, updated_at)
            VALUES ('rec-test-post-uuid', ?, 'Post for recommendation testing', 'PUBLIC', 'text', NOW(), NOW())
        `,
      [targetUserId],
    );

    // Both target and Candidate 4 comment on post
    await queryRunner.query(
      `
            INSERT INTO comments (id, user_id, target_id, target_type, content, created_at, updated_at)
            VALUES 
                ('rec-comment-target', ?, 'rec-test-post-uuid', 'POST', 'Target comment', NOW(), NOW()),
                ('rec-comment-cand', 'rec-user-interaction-uuid', 'rec-test-post-uuid', 'POST', 'Candidate comment', NOW(), NOW())
        `,
      [targetUserId],
    );

    // Both target and Candidate 4 react to post (reactions has no updated_at column)
    await queryRunner.query(
      `
            INSERT INTO reactions (id, user_id, target_id, target_type, type, created_at)
            VALUES 
                ('rec-reaction-target', ?, 'rec-test-post-uuid', 'POST', 'LIKE', NOW()),
                ('rec-reaction-cand', 'rec-user-interaction-uuid', 'rec-test-post-uuid', 'POST', 'LIKE', NOW())
        `,
      [targetUserId],
    );

    // Signal 5: Shared Networks (Same IP / device)
    await insertUser(
      'rec-user-network-uuid',
      'rec_network@example.com',
      'Network Candidate',
      'rec_network',
    );

    await queryRunner.query(
      `
            INSERT INTO refresh_tokens (id, user_id, token_hash, ip_address, device_info, expires_at, created_at)
            VALUES 
                ('rec-token-target', ?, 'dummy-token-1-hash', '192.168.1.100', 'Chrome-Test-Device', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW()),
                ('rec-token-cand', 'rec-user-network-uuid', 'dummy-token-2-hash', '192.168.1.100', 'Chrome-Test-Device', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW())
        `,
      [targetUserId],
    );

    // --- EXCLUSION CRITERIA TEST CASES ---

    // Exclusion 1: Already friends with target
    await insertUser(
      'rec-user-already-friend-uuid',
      'rec_friend@example.com',
      'Already Friend Excluded',
      'rec_friend',
    );
    await queryRunner.query(
      `INSERT INTO friends (user_id, friend_id, created_at) VALUES (?, 'rec-user-already-friend-uuid', NOW()), ('rec-user-already-friend-uuid', ?, NOW())`,
      [targetUserId, targetUserId],
    );

    // Exclusion 2: Pending incoming request
    await insertUser(
      'rec-user-pending-inc-uuid',
      'rec_pending_inc@example.com',
      'Pending Incoming Excluded',
      'rec_pending_inc',
    );
    await queryRunner.query(
      `
            INSERT INTO friend_requests (id, sender_id, receiver_id, status, created_at)
            VALUES ('rec-req-incoming', 'rec-user-pending-inc-uuid', ?, 'PENDING', NOW())
        `,
      [targetUserId],
    );

    // Exclusion 3: Pending outgoing request
    await insertUser(
      'rec-user-pending-out-uuid',
      'rec_pending_out@example.com',
      'Pending Outgoing Excluded',
      'rec_pending_out',
    );
    await queryRunner.query(
      `
            INSERT INTO friend_requests (id, sender_id, receiver_id, status, created_at)
            VALUES ('rec-req-outgoing', ?, 'rec-user-pending-out-uuid', 'PENDING', NOW())
        `,
      [targetUserId],
    );

    // Exclusion 4: Blocked user
    await insertUser(
      'rec-user-blocked-uuid',
      'rec_blocked@example.com',
      'Blocked User Excluded',
      'rec_blocked',
    );
    await queryRunner.query(
      `
            INSERT INTO blocks (blocker_id, blocked_id, reason, created_at)
            VALUES (?, 'rec-user-blocked-uuid', 'Testing blocks', NOW())
        `,
      [targetUserId],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clean up all test objects using exact test IDs/uuids
    const testUserIds = [
      'test-target-user-uuid',
      'rec-user-mutual-uuid',
      'rec-friend-1-uuid',
      'rec-friend-2-uuid',
      'rec-friend-3-uuid',
      'rec-user-edu-city-uuid',
      'rec-user-work-group-uuid',
      'rec-user-interaction-uuid',
      'rec-user-network-uuid',
      'rec-user-already-friend-uuid',
      'rec-user-pending-inc-uuid',
      'rec-user-pending-out-uuid',
      'rec-user-blocked-uuid',
    ];

    // Delete blocks
    await queryRunner.query(
      `DELETE FROM blocks WHERE blocker_id IN (?) OR blocked_id IN (?)`,
      [testUserIds, testUserIds],
    );

    // Delete friend requests
    await queryRunner.query(
      `DELETE FROM friend_requests WHERE sender_id IN (?) OR receiver_id IN (?) OR id IN ('rec-req-incoming', 'rec-req-outgoing')`,
      [testUserIds, testUserIds],
    );

    // Delete friends
    await queryRunner.query(
      `DELETE FROM friends WHERE user_id IN (?) OR friend_id IN (?)`,
      [testUserIds, testUserIds],
    );

    // Delete refresh tokens
    await queryRunner.query(
      `DELETE FROM refresh_tokens WHERE user_id IN (?) OR id IN ('rec-token-target', 'rec-token-cand')`,
      [testUserIds],
    );

    // Delete comments & reactions
    await queryRunner.query(
      `DELETE FROM comments WHERE target_id = 'rec-test-post-uuid' OR user_id IN (?)`,
      [testUserIds],
    );
    await queryRunner.query(
      `DELETE FROM reactions WHERE target_id = 'rec-test-post-uuid' OR user_id IN (?)`,
      [testUserIds],
    );

    // Delete posts
    await queryRunner.query(
      `DELETE FROM posts WHERE id = 'rec-test-post-uuid' OR user_id IN (?)`,
      [testUserIds],
    );

    // Delete group members
    await queryRunner.query(
      `DELETE FROM group_members WHERE group_id = 'rec-test-group-uuid' OR user_id IN (?)`,
      [testUserIds],
    );

    // Delete groups
    await queryRunner.query(
      `DELETE FROM \`groups\` WHERE id = 'rec-test-group-uuid'`,
    );

    // Delete profiles
    await queryRunner.query(`DELETE FROM profiles WHERE user_id IN (?)`, [
      testUserIds,
    ]);

    // Delete users
    await queryRunner.query(`DELETE FROM users WHERE id IN (?)`, [testUserIds]);
  }
}
