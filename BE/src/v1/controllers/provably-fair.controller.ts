import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { ProvablyFairService } from '../services/provably-fair.service';
import { PokerStateService } from '../services/poker-state.service';
import { ProvablyFairAudit } from '../entities/provably_fair_audit.entity';
import { IsNull } from 'typeorm';

@Controller('provably-fair')
@UseGuards(AuthGuard)
export class ProvablyFairController {
  constructor(
    private readonly provablyFairService: ProvablyFairService,
    private readonly pokerStateService: PokerStateService,
  ) {}

  /**
   * Retrieves seed information for the active or next hand.
   */
  @Get('current')
  async getCurrentSeeds(@Query('table_id') tableId: string) {
    if (!tableId) {
      throw new BadRequestException('table_id is required');
    }

    // Try to get from active hand in database
    const activeAudit = await ProvablyFairAudit.findOne({
      where: { table_id: tableId, revealed_at: IsNull() },
      order: { created_at: 'DESC' },
    });

    if (activeAudit) {
      return {
        server_seed_hash: activeAudit.server_seed_hash,
        client_seed: activeAudit.client_seed,
        nonce: activeAudit.nonce,
        status: 'active',
      };
    }

    // No active hand, look up last hand to predict next nonce/seed
    const lastAudit = await ProvablyFairAudit.findOne({
      where: { table_id: tableId },
      order: { created_at: 'DESC' },
    });

    const nextNonce = lastAudit ? lastAudit.nonce + 1 : 1;

    // Check if user set a next_client_seed in Redis
    const tableState = await this.pokerStateService.getTableState(tableId);
    const clientSeed =
      (tableState && tableState.next_client_seed) || 'default_client_seed';

    return {
      server_seed_hash: null, // Server seed hash is generated and committed when hand starts
      client_seed: clientSeed,
      nonce: nextNonce,
      status: 'pending',
    };
  }

  /**
   * Submits next client seed for the player at a specific table.
   */
  @Post('client-seed')
  async setClientSeed(
    @Request() req,
    @Body() body: { table_id: string; client_seed: string },
  ) {
    const { table_id: tableId, client_seed: clientSeed } = body;
    if (!tableId || !clientSeed) {
      throw new BadRequestException('table_id and client_seed are required');
    }

    if (clientSeed.length > 64) {
      throw new BadRequestException('client_seed cannot exceed 64 characters');
    }

    // Store in table state so it will be picked up at the start of next hand
    await this.pokerStateService.setTableState(tableId, {
      next_client_seed: clientSeed,
    });

    return {
      success: true,
      next_client_seed: clientSeed,
    };
  }

  /**
   * Endpoint to verify a completed hand using audit logs.
   */
  @Get('verify')
  async verifyHand(@Query('hand_id') handId: string) {
    if (!handId) {
      throw new BadRequestException('hand_id is required');
    }

    const audit = await ProvablyFairAudit.findOne({
      where: { hand_id: handId },
    });

    if (!audit) {
      throw new NotFoundException('Audit log not found for the specified hand');
    }

    if (!audit.revealed_at) {
      throw new BadRequestException(
        'Hand is still in progress and seeds cannot be revealed yet',
      );
    }

    // Decrypt the server seed
    let decryptedServerSeed: string;
    try {
      decryptedServerSeed = this.provablyFairService.decryptServerSeed(
        audit.encrypted_server_seed,
        audit.auth_tag,
      );
    } catch {
      throw new BadRequestException('Failed to decrypt server seed');
    }

    // Re-shuffle to verify
    const verifiedDeck = this.provablyFairService.shuffleDeck(
      decryptedServerSeed,
      audit.client_seed,
      audit.nonce,
    );

    return {
      hand_id: audit.hand_id,
      table_id: audit.table_id,
      server_seed: decryptedServerSeed,
      server_seed_hash: audit.server_seed_hash,
      client_seed: audit.client_seed,
      nonce: audit.nonce,
      deck_hash: audit.deck_hash,
      shuffled_deck: verifiedDeck,
      created_at: audit.created_at,
      revealed_at: audit.revealed_at,
    };
  }
}
