import { Injectable, NotFoundException } from '@nestjs/common';
import { GameHand } from '../../entities/game_hand.entity';
import { HandPlayer } from '../../entities/hand_player.entity';
import { HandAction } from '../../entities/hand_action.entity';
import { ProvablyFairAudit } from '../../entities/provably_fair_audit.entity';
import {
  decodeCursor,
  buildCursorPaginationResponse,
} from '../../utils/pagination.util';

@Injectable()
export class AdminHandsService {
  async getHands(cursor: string | undefined, limit: number, tableId?: string) {
    const query = GameHand.createQueryBuilder('hand').leftJoinAndSelect(
      'hand.table',
      'table',
    );

    if (tableId) {
      query.where('hand.table_id = :tableId', { tableId });
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        if (tableId) {
          query.andWhere(
            '(hand.created_at < :time OR (hand.created_at = :time AND hand.id < :id))',
            { time: decoded.time, id: decoded.id },
          );
        } else {
          query.where(
            '(hand.created_at < :time OR (hand.created_at = :time AND hand.id < :id))',
            { time: decoded.time, id: decoded.id },
          );
        }
      }
    }

    query.orderBy('hand.created_at', 'DESC').addOrderBy('hand.id', 'DESC');
    query.take(limit + 1);

    const hands = await query.getMany();

    const mappedHands = hands.map((h) => ({
      id: h.id,
      created_at: h.created_at,
      table_id: h.table_id,
      table_name: h.table?.name || 'Unknown Table',
      total_pot: Number(h.total_pot),
      rake_amount: Number(h.rake_amount),
      community_cards: h.community_cards,
      ended_at: h.ended_at || h.created_at,
    }));

    return buildCursorPaginationResponse(mappedHands, limit);
  }

  async getHandDetail(id: string) {
    const hand = await GameHand.findOne({
      where: { id },
      relations: ['table'],
    });
    if (!hand) throw new NotFoundException('Hand not found');

    const players = await HandPlayer.find({
      where: { hand_id: id },
      relations: ['user'],
    });

    const actions = await HandAction.find({
      where: { hand_id: id },
      relations: ['user'],
      order: { action_order: 'ASC' },
    });

    const provablyFair = await ProvablyFairAudit.findOne({
      where: { hand_id: id },
    });

    return {
      hand: {
        id: hand.id,
        table_id: hand.table_id,
        table_name: hand.table?.name || 'Unknown Table',
        dealer_seat: hand.dealer_seat,
        small_blind_seat: hand.small_blind_seat,
        big_blind_seat: hand.big_blind_seat,
        total_pot: Number(hand.total_pot),
        rake_amount: Number(hand.rake_amount),
        community_cards: hand.community_cards,
        started_at: hand.started_at,
        ended_at: hand.ended_at,
        server_seed: hand.server_seed,
        client_seed: hand.client_seed,
        shuffled_deck: hand.shuffled_deck,
      },
      provably_fair: provablyFair
        ? {
            id: provablyFair.id,
            server_seed_hash: provablyFair.server_seed_hash,
            encrypted_server_seed: provablyFair.encrypted_server_seed,
            auth_tag: provablyFair.auth_tag,
            client_seed: provablyFair.client_seed,
            nonce: provablyFair.nonce,
            deck_hash: provablyFair.deck_hash,
            algorithm_version: provablyFair.algorithm_version,
            revealed_at: provablyFair.revealed_at,
          }
        : null,
      players: players.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        username: p.user?.user_name || 'Unknown User',
        hole_cards: p.hole_cards,
        chips_before: Number(p.chips_before),
        chips_bet: Number(p.chips_bet),
        chips_won: Number(p.chips_won),
        net_gain_loss: Number(p.net_gain_loss),
        is_winner: p.is_winner,
        seat_number: p.seat_number,
      })),
      actions: actions.map((a) => ({
        id: a.id,
        user_id: a.user_id,
        username: a.user?.user_name || 'Unknown User',
        seat_number: a.seat_number,
        stage: a.stage,
        action_type: a.action_type,
        amount: Number(a.amount),
        action_order: a.action_order,
        is_all_in: a.is_all_in,
      })),
    };
  }
}
