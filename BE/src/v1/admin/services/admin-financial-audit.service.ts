import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminFinancialAuditService {
  constructor(private readonly dataSource: DataSource) {}

  async getChipDumpingAlerts() {
    const query = `
      SELECT
        hp1.user_id AS dumper_id,
        u1.user_name AS dumper_username,
        hp2.user_id AS receiver_id,
        u2.user_name AS receiver_username,
        COUNT(hp1.hand_id) AS joint_hands,
        SUM(CAST(hp1.chips_bet AS SIGNED)) AS total_dumper_bet,
        SUM(CAST(hp2.chips_won AS SIGNED)) AS total_receiver_won,
        SUM(CAST(hp2.net_gain_loss AS SIGNED)) AS total_receiver_net
      FROM hand_players hp1
      INNER JOIN hand_players hp2 ON hp1.hand_id = hp2.hand_id AND hp1.user_id != hp2.user_id
      INNER JOIN users u1 ON hp1.user_id = u1.id
      INNER JOIN users u2 ON hp2.user_id = u2.id
      WHERE CAST(hp1.net_gain_loss AS SIGNED) < 0 
        AND CAST(hp2.net_gain_loss AS SIGNED) > 0 
        AND hp2.is_winner = 1
      GROUP BY hp1.user_id, hp2.user_id, u1.user_name, u2.user_name
      HAVING joint_hands >= 3 AND total_receiver_net >= 50000
      ORDER BY total_receiver_net DESC;
    `;

    const results = await this.dataSource.query(query);

    return results.map((row) => {
      const net = Number(row.total_receiver_net);
      const hands = Number(row.joint_hands);
      let riskLevel = 'LOW';
      if (net >= 500000 || hands >= 10) {
        riskLevel = 'HIGH';
      } else if (net >= 100000 || hands >= 5) {
        riskLevel = 'MEDIUM';
      }

      return {
        dumper: { id: row.dumper_id, username: row.dumper_username },
        receiver: { id: row.receiver_id, username: row.receiver_username },
        joint_hands: hands,
        total_dumper_bet: Number(row.total_dumper_bet),
        total_receiver_won: Number(row.total_receiver_won),
        total_receiver_net: net,
        risk_level: riskLevel,
      };
    });
  }
}
