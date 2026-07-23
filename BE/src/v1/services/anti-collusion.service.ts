import { Injectable, Logger } from '@nestjs/common';
import { PokerStateService } from './poker-state.service';
import { AuditLog } from '../entities/audit_log.entity';
import { TableSession } from '../entities/table_session.entity';

@Injectable()
export class AntiCollusionService {
  private readonly logger = new Logger(AntiCollusionService.name);

  constructor(private readonly stateService: PokerStateService) {}

  /**
   * Calculates the collusion risk score (0-100) for a user trying to sit in a table.
   */
  async calculateRiskScore(
    userId: string,
    roomId: string,
    ip: string,
    userAgent: string,
    deviceFingerprint: string,
  ): Promise<{ score: number; reasons: string[]; details: any }> {
    let score = 0;
    const reasons: string[] = [];
    const details: any = {
      ipMatches: [],
      fingerprintMatches: [],
      subnetMatches: [],
      financialTies: [],
    };

    const seats = await this.stateService.getAllSeats(roomId);
    if (!seats || seats.length === 0) {
      return { score, reasons, details };
    }

    const cleanIp = (ip || '').replace(/^::ffff:/, '').trim();
    const cleanSubnet = this.getSubnet24(cleanIp);

    let ipMatchScore = 0;
    let fingerprintMatchScore = 0;

    for (const seat of seats) {
      if (seat.user_id === userId) continue;
      if (seat.is_bot === '1') continue;

      // 1. IP / Subnet matching
      const seatIp = String(seat.ip || '')
        .replace(/^::ffff:/, '')
        .trim();
      if (
        seatIp &&
        cleanIp &&
        seatIp !== '127.0.0.1' &&
        cleanIp !== '127.0.0.1'
      ) {
        if (seatIp === cleanIp) {
          ipMatchScore = Math.max(ipMatchScore, 30);
          details.ipMatches.push(seat.username);
        } else {
          const otherSubnet = this.getSubnet24(seatIp);
          if (otherSubnet === cleanSubnet) {
            ipMatchScore = Math.max(ipMatchScore, 30);
            details.subnetMatches.push(seat.username);
          }
        }
      }

      // 2. Browser Fingerprint similarity matching
      const seatFingerprint = String(seat.device_fingerprint || '');
      const seatUserAgent = String(seat.user_agent || '');

      if (
        deviceFingerprint &&
        seatFingerprint &&
        deviceFingerprint === seatFingerprint
      ) {
        fingerprintMatchScore = Math.max(fingerprintMatchScore, 40);
        details.fingerprintMatches.push(seat.username);
      } else if (
        userAgent &&
        seatUserAgent &&
        userAgent === seatUserAgent &&
        userAgent !== ''
      ) {
        fingerprintMatchScore = Math.max(fingerprintMatchScore, 20);
        details.fingerprintMatches.push(`${seat.username} (User-Agent Match)`);
      }
    }

    if (ipMatchScore > 0) {
      score += ipMatchScore;
      reasons.push(`IP Subnet trùng lặp (+${ipMatchScore}đ)`);
    }
    if (fingerprintMatchScore > 0) {
      score += fingerprintMatchScore;
      reasons.push(
        `Browser Fingerprint trùng lặp (+${fingerprintMatchScore}đ)`,
      );
    }

    // 3. Financial ties check (e.g. mutual transfer or shared IP history in TableSession)
    let financialTieScore = 0;
    try {
      const seatedUserIds = seats
        .map((s) => s.user_id)
        .filter((id) => id !== userId);
      if (seatedUserIds.length > 0) {
        const hasTies = await this.checkFinancialTies(userId, seatedUserIds);
        if (hasTies) {
          financialTieScore = 30;
          details.financialTies.push(
            'History of chip-dumping/transfer behavior detected',
          );
        }
      }
    } catch (e) {
      this.logger.error(`Error checking financial ties: ${e.message}`);
    }

    if (financialTieScore > 0) {
      score += financialTieScore;
      reasons.push(
        `Lịch sử nạp/rút/chuyển chip nghi vấn (+${financialTieScore}đ)`,
      );
    }

    return { score, reasons, details };
  }

  private getSubnet24(ip: string): string {
    if (!ip) return '';
    const parts = ip.split('.');
    if (parts.length >= 3) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return ip;
  }

  private async checkFinancialTies(
    userId: string,
    otherUserIds: string[],
  ): Promise<boolean> {
    if (!otherUserIds || otherUserIds.length === 0) return false;

    // Simple detection: check if they have historically shared similar subnets or logged in IPs
    // Or check if they have mutual session interactions in the database
    // For security audit compliance, we query if there is any shared session IP address overlap in past TableSessions
    const [userSessions, otherSessions] = await Promise.all([
      TableSession.find({
        where: { user_id: userId },
        take: 10,
      }),
      TableSession.createQueryBuilder('session')
        .where('session.user_id IN (:...otherUserIds)', { otherUserIds })
        .orderBy('session.created_at', 'DESC')
        .limit(30)
        .getMany(),
    ]);

    // Just check if they ever played at the same table in the past
    const sharedRooms = new Set(userSessions.map((s) => s.table_id));
    for (const os of otherSessions) {
      if (sharedRooms.has(os.table_id)) {
        // Yes, they have played together in the past
        return true;
      }
    }

    return false;
  }

  /**
   * Log collusion warnings into the AuditLog
   */
  async logCollusionWarning(
    userId: string,
    roomId: string,
    score: number,
    reasons: string[],
    ip: string,
    userAgent: string,
  ) {
    try {
      const log = new AuditLog();
      log.event_type = 'CHEAT_DETECTED';
      log.user_id = userId;
      log.room_id = roomId;
      log.level = score >= 60 ? 'CRITICAL' : 'WARNING';
      log.description = `Phát hiện rủi ro thông đồng: Risk Score = ${score}/100. Lý do: ${reasons.join(', ')}`;
      log.ip_address = ip;
      log.user_agent = userAgent;
      log.metadata = {
        risk_score: score,
        reasons,
      };
      await log.save();
    } catch (err) {
      this.logger.error(
        `Failed to save audit log for collusion warning: ${err.message}`,
      );
    }
  }
}
