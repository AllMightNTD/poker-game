import { MessagePermission, UserStatus } from 'src/constants/enums';

export class UserDomainEntity {
  id?: string;
  email?: string;
  phone?: string;
  password?: string;
  facebookId?: string;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  status?: UserStatus;
  isActiveStatus?: boolean;
  messagePermission?: MessagePermission;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(init?: Partial<UserDomainEntity>) {
    Object.assign(this, init);
  }
}
