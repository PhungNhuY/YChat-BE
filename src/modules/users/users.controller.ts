import {
  BadRequestException,
  Controller,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { UsersService } from './users.service';
import {
  buildSuccessResponse,
  transformArrayToResponse,
  transformObjectToResponse,
} from '@utils/api-response-builder.util';
import { UserResponseDto } from './dtos/user-response.dto';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import { AuthData } from '@utils/types';
import { ApiQueryDto } from '@common/api-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'node:path';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { AssetResponseDto } from '@modules/assets/dtos/asset-response.dto';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller('users')
@UseGuards(JwtAccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@UseAuthData() authData: AuthData) {
    const profile = await this.usersService.findOne(authData._id);
    return buildSuccessResponse(
      transformObjectToResponse(profile, UserResponseDto),
    );
  }

  @Get()
  async find(
    @Query() apiQueryDto: ApiQueryDto,
    @UseAuthData() authData: AuthData,
  ) {
    const data = await this.usersService.find(apiQueryDto, authData);
    return buildSuccessResponse(
      transformArrayToResponse(data, UserResponseDto),
    );
  }

  @Put('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      // NOTE: fileSize limit here will not throw exception, so config this in ParseFilePipe
      fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          // Allow storage of file
          cb(null, true);
        } else {
          // Reject file
          cb(
            new BadRequestException(
              `Unsupported file type ${extname(file.originalname)}`,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const uploadPath = './assets/temp';
          const imagesPath = './assets/images';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          if (!existsSync(imagesPath)) {
            mkdirSync(imagesPath, { recursive: true });
          }
          return cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          return cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: +process.env.MAX_FILE_SIZE * 1024 * 1024,
            message: `File size too large (Max ${+process.env.MAX_FILE_SIZE}MB)`,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @UseAuthData() authData: AuthData,
  ) {
    const image = await this.usersService.updateAvatar(authData, file);
    return buildSuccessResponse(
      transformObjectToResponse(image, AssetResponseDto),
    );
  }
}
