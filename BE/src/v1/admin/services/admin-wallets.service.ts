import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Wallet } from '../../entities/wallet.entity';
import { UpdateWalletDto } from '../dto/update-wallet.dto';

@Injectable()
export class AdminWalletsService {
  async getWallet(userId: string) {
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async updateWallet(userId: string, dto: UpdateWalletDto) {
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    let currentBalance = BigInt(wallet.chips_balance);
    const amount = BigInt(dto.amount);

    if (dto.action === 'ADD') {
      currentBalance += amount;
    } else if (dto.action === 'REMOVE') {
      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient balance to remove');
      }
      currentBalance -= amount;
    } else if (dto.action === 'SET') {
      currentBalance = amount;
    }

    wallet.chips_balance = currentBalance.toString();
    await wallet.save();

    return {
      success: true,
      message: 'Wallet updated successfully',
      new_balance: wallet.chips_balance
    };
  }
}
