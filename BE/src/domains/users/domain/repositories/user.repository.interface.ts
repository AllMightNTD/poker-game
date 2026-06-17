import { UserDomainEntity } from '../entities/user.domain-entity';

export interface IUserRepository {
  findById(id: string): Promise<UserDomainEntity | null>;
  findByIdWithRelations(id: string, relations: string[]): Promise<any | null>;
  save(user: UserDomainEntity): Promise<UserDomainEntity>;
  updatePresence(id: string, isActive: boolean): Promise<any>;
  updateMessagePermission(id: string, permission: any): Promise<any>;
  blockUser(userId: string, targetUserId: string, reason?: string): Promise<any>;
  unblockUser(userId: string, targetUserId: string): Promise<any>;
  getBlockedUsers(userId: string): Promise<any[]>;
  getListGroup(userId: string): Promise<any>;
  updateProfile(userId: string, updateProfileDto: any): Promise<any>;
  updateSettings(userId: string, updateSettingsDto: any): Promise<any>;
}
