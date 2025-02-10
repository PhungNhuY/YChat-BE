import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { Token } from './schemas/token.schema';
import { comparePlainValueWithHashedValue, hash } from '@utils/hash.util';
import { ETokenType } from '@constants/token.constant';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>,
  ) {}

  async isTokenValid(
    userId: string,
    tokenId: string,
    type: ETokenType,
    tokenValue: string,
  ): Promise<boolean> {
    const token = await this.findValidToken(userId, tokenId, type, tokenValue);
    return !!token;
  }

  async findValidToken(
    userId: string,
    tokenId: string,
    type: ETokenType,
    tokenValue: string,
  ): Promise<Token | null> {
    const tokenData = await this.tokenModel
      .findOne({
        deleted_at: null,
        _id: tokenId,
        type,
        expiresAt: {
          $gte: Date.now(),
        },
      })
      .lean();
    if (
      // token not found
      !tokenData ||
      // token value does not match
      !(await comparePlainValueWithHashedValue(tokenValue, tokenData.token))
    )
      return null;

    return tokenData;
  }

  async createActivationToken(
    userId: string,
    expiresAt: number,
    session?: ClientSession,
  ): Promise<[string, string]> {
    // delete all previous activation tokens
    await this.deleteAllTokensByType(userId, ETokenType.ACTIVATION, session);

    // create
    const token = randomBytes(32).toString('hex');
    const hashedToken = await hash(token);
    const tokenDoc = await this.create(
      userId,
      ETokenType.ACTIVATION,
      hashedToken,
      expiresAt,
      session,
    );

    return [tokenDoc._id.toString(), token];
  }

  async createForgotPasswordToken(
    userId: string,
    expiresAt: number,
    session?: ClientSession,
  ): Promise<[string, string]> {
    // delete all previous forgot-password tokens
    await this.deleteAllTokensByType(
      userId,
      ETokenType.FORGOT_PASSWORD,
      session,
    );

    // create
    const token = randomBytes(32).toString('hex');
    const hashedToken = await hash(token);
    const tokenDoc = await this.create(
      userId,
      ETokenType.FORGOT_PASSWORD,
      hashedToken,
      expiresAt,
      session,
    );

    return [tokenDoc._id.toString(), token];
  }

  async deleteAllTokensByType(
    userId: string,
    type: ETokenType,
    session?: ClientSession,
  ): Promise<void> {
    await this.tokenModel.updateMany(
      {
        user: userId,
        type,
        deleted_at: null,
      },
      {
        deleted_at: new Date(),
      },
      {
        ...(session && { session }),
      },
    );
  }

  private async create(
    userId: string,
    type: ETokenType,
    hashedToken: string,
    expiresAt: number,
    session?: ClientSession,
  ): Promise<Token> {
    const [tokenDoc] = await this.tokenModel.create(
      [
        {
          user: userId,
          type,
          token: hashedToken,
          expiresAt: expiresAt,
        },
      ],
      {
        ...(session && { session }),
      },
    );
    return tokenDoc;
  }

  async revokeToken(tokenId: string, session?: ClientSession) {
    await this.tokenModel.findOneAndUpdate(
      {
        _id: tokenId,
        deleted_at: null,
      },
      {
        deleted_at: new Date(),
      },
      {
        ...(session && { session }),
      },
    );
  }
}
