import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { RegisterDto } from '@modules/auth/dtos/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findOne(userId: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: userId, deletedAt: null })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(
    createUserData: RegisterDto & {
      verificationCode: string;
      verificationCodeExpiresAt: number;
    },
  ): Promise<User> {
    await this.validate(createUserData, null);
    return await this.userModel.create(createUserData);
  }

  async findLoginUser(email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email, deletedAt: null })
      .select('+password')
      .lean();
    return user;
  }

  private async validate(data: Partial<RegisterDto>, userId: string | null) {
    const uniqueFields: FilterQuery<User>[] = [];
    data.email && uniqueFields.push({ email: data.email });

    const matchObject: FilterQuery<User> = {
      deletedAt: null,
      _id: { $ne: userId },
      $or: [...uniqueFields],
    };

    const existedUser = await this.userModel.findOne(matchObject).lean();
    if (existedUser) {
      throw new BadRequestException('Email has been duplicated');
    }
  }
}
