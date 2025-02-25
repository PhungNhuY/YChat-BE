import {
  BadRequestException,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      //   limits: {
      //     fileSize: +process.env.MAX_FILE_SIZE * 1024 * 1024,
      //   },
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
          const uploadPath = './assets/images';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
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
  ) {
    console.log(file);
  }
}
