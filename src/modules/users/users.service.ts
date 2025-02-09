import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import { RegisterDto } from '@modules/auth/dtos/register.dto';
import { ApiQueryDto } from '@common/api-query.dto';
import { AuthData } from '@utils/types';
import { EUserStatus } from '@constants/user.constant';
import { MultiItemsResponse } from '@utils/api-response-builder.util';

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
      validTokenIat: number;
    },
    session?: ClientSession,
  ): Promise<User> {
    await this.validate(createUserData, null);
    const [user] = await this.userModel.create([createUserData], {
      ...(session && { session }),
    });
    return user;
  }

  async findLoginUser(email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email, deletedAt: null })
      .select('+password')
      .lean();
    return user;
  }

  async find(
    query: ApiQueryDto,
    authData: AuthData,
  ): Promise<MultiItemsResponse<User>> {
    // build filter query
    const filter: FilterQuery<User> = {
      deletedAt: null,
      status: EUserStatus.ACTIVE,
    };
    query?.q &&
      Object.assign(filter, {
        $or: [{ name: { $regex: query.q, $options: 'i' } }],
      });

    // build get users query
    const itemsQuery = this.userModel.find(filter);
    query?.page && itemsQuery.skip((query.page - 1) * query.limit);
    query?.limit && itemsQuery.limit(query.limit);
    // query?.sortBy && itemsQuery.sort(query.sortBy);
    // query?.fields && itemsQuery.select(query.fields);
    itemsQuery.lean();

    // build get total of users query
    const totalQuery = this.userModel.countDocuments(filter);

    const [items, total] = await Promise.all([itemsQuery, totalQuery]);

    return { items, total };
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
