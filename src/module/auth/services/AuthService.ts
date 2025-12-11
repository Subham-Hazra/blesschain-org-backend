import { hash, compare } from 'bcrypt';
import { HttpException } from '@/exceptions/HttpException';
import { CreateUser, User } from '@/module/user/interfaces/index.interface';
import userModel from '@/module/user/models/user.schema';
import { isEmpty } from "@/util/util";
import { sign, verify } from 'jsonwebtoken';
import { DataStoredInToken, TokenData } from '@/module/auth/interfaces/auth.interface';


class AuthService {
  public users = userModel;

  private readonly refreshSecretKey: string = process.env.REFRESH_SECRET_KEY ?? '';

  public async login(userData: CreateUser): Promise<{ authToken: string; refreshTokenCookie:string; findUser: User }> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "Password is not matching");

    const accessTokenData = this.createAccessToken(findUser);
    const refreshTokenData = this.createRefreshToken(findUser);
      // const accessTokenCookie = this.createCookie(accessTokenData, 'accessToken');
    const refreshTokenCookie = this.createCookie(refreshTokenData, 'refreshToken');
    const authToken = accessTokenData.token;
    findUser.password = '';
    return {authToken,refreshTokenCookie, findUser };
  }
  public async loginUser(userData: CreateUser): Promise<{ authToken: string; refreshTokenCookie:string; findUser: User }> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    console.log(userData,'user datatat-----')
    const findUser = await this.users.findOne({ mobile: userData.mobile });
    if (!findUser) throw new HttpException(409, `This mobile ${userData.mobile} was not found`);

    const accessTokenData = this.createAccessToken(findUser);
    const refreshTokenData = this.createRefreshToken(findUser);
      // const accessTokenCookie = this.createCookie(accessTokenData, 'accessToken');
    const refreshTokenCookie = this.createCookie(refreshTokenData, 'refreshToken');
    const authToken = accessTokenData.token;
    findUser.password = '';
    return {authToken,refreshTokenCookie, findUser };
  }

  public async logout(userData?: User): Promise<User> {
    if (!userData || isEmpty(userData)) throw new HttpException(400, "userData is empty");
    const findUser = await this.users.findOne({ mobile: userData.mobile }).select('-password');
    if (!findUser) throw new HttpException(409, `This mobile ${userData.mobile} was not found`);
    return findUser;
  }

  public createAccessToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = process.env.SECRET_KEY ?? '';
    const expiresIn: number = 2 * 24 * 60 * 60; // 2 day
    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createRefreshToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const expiresIn: number = 60 * 60 * 24 * 7; // 1 week
    return { expiresIn, token: sign(dataStoredInToken, this.refreshSecretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData, type: 'accessToken' | 'refreshToken'): string {
    const name = type === 'accessToken' ? 'Authorization' : 'RefreshToken';
    return `${name}=${tokenData.token}; Path=/api; HttpOnly; Max-Age=${tokenData.expiresIn}; Secure`;
  }

   
  public async validateRefreshToken(token: string): Promise<DataStoredInToken> {
    try {
      const decoded = verify(token, this.refreshSecretKey) as DataStoredInToken;
      return decoded;
    } catch (error) {
      throw new HttpException(401, "Invalid or expired refresh token");
    }
  }

  public async refreshAccessToken(userData: CreateUser): Promise<{ authToken: string }> {
    const accessTokenData = this.createAccessToken(userData);
    const authToken = accessTokenData.token;
    return {authToken};
  }
}

export default AuthService;
