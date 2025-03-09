import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ClientSession, Connection, FilterQuery, Model } from 'mongoose';
import { RegisterDto } from '@modules/auth/dtos/register.dto';
import { ApiQueryDto } from '@common/api-query.dto';
import { AuthData } from '@utils/types';
import { EUserStatus } from '@constants/user.constant';
import { MultiItemsResponse } from '@utils/api-response-builder.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AssetsService } from '@modules/assets/assets.service';
import { mongooseTransaction } from '@common/mongoose-transaction';
import { Asset } from '@modules/assets/schemas/asset.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectConnection() private readonly connection: Connection,
    private readonly assetsService: AssetsService,
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

  async updatePassword(
    userId: string,
    password: string,
    session?: ClientSession,
  ) {
    const user = await this.userModel.findOne({
      _id: userId,
      deletedAt: null,
    });
    if (!user) throw new NotFoundException('User not found');
    user.password = password;
    user.validTokenIat = Math.round(Date.now() / 1000);
    await user.save({ ...(session && { session }) });
    // clear cache
    await this.cacheManager.del(`iat:${user._id.toString()}`);
  }

  async updateAvatar(
    authData: AuthData,
    image: Express.Multer.File,
  ): Promise<Asset> {
    const user = await this.userModel.findOne({
      _id: authData._id,
      deletedAt: null,
    });
    if (!user) throw new NotFoundException('User not found');

    let asset: Asset;
    await mongooseTransaction(this.connection, async (session) => {
      // save image
      asset = await this.assetsService.uploadImage(image, authData, session);

      // update user
      user.avatar = asset._id.toString();
      await user.save({ session });
    });

    return asset;
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
