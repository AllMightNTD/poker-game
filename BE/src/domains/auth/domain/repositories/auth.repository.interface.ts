export interface IAuthRepository {
  findUserByEmailOrPhone(emailOrPhone: string): Promise<any | null>;
  findUserByFacebookId(facebookId: string): Promise<any | null>;
  findUserByEmail(email: string): Promise<any | null>;
  findUserByResetPasswordToken(token: string): Promise<any | null>;
  saveUser(user: any): Promise<any>;
  findProfileByUsername(username: string): Promise<any | null>;
  createRegisterTransaction(userData: any, profileData: any): Promise<any>;
  saveRefreshToken(tokenData: any): Promise<any>;
  revokeRefreshTokens(userId: string): Promise<any>;
}
