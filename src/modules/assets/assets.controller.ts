import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import { ObjectIdValidationPipe } from 'src/pipes/objectid-validation.pipe';
import { Response } from 'express';

@Controller('assets')
@UseGuards(JwtAccessTokenGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // @Post('images')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     // NOTE: fileSize limit here will not throw exception, so config this in ParseFilePipe
  //     fileFilter: (req: any, file: any, cb: any) => {
  //       if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
  //         // Allow storage of file
  //         cb(null, true);
  //       } else {
  //         // Reject file
  //         cb(
  //           new BadRequestException(
  //             `Unsupported file type ${extname(file.originalname)}`,
  //           ),
  //           false,
  //         );
  //       }
  //     },
  //     storage: diskStorage({
  //       destination: (req: any, file: any, cb: any) => {
  //         const uploadPath = './assets/temp';
  //         const imagesPath = './assets/images';
  //         if (!existsSync(uploadPath)) {
  //           mkdirSync(uploadPath, { recursive: true });
  //         }
  //         if (!existsSync(imagesPath)) {
  //           mkdirSync(imagesPath, { recursive: true });
  //         }
  //         return cb(null, uploadPath);
  //       },
  //       filename: (req, file, cb) => {
  //         return cb(null, `${randomUUID()}${extname(file.originalname)}`);
  //       },
  //     }),
  //   }),
  // )
  // async uploadImage(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({
  //           maxSize: +process.env.MAX_FILE_SIZE * 1024 * 1024,
  //           message: `File size too large (Max ${+process.env.MAX_FILE_SIZE}MB)`,
  //         }),
  //       ],
  //       fileIsRequired: true,
  //     }),
  //   )
  //   file: Express.Multer.File,
  //   @UseAuthData() authData: AuthData,
  // ) {
  //   const image = await this.assetsService.uploadImage(file, authData);
  //   return buildSuccessResponse(
  //     transformObjectToResponse(image, AssetResponseDto),
  //   );
  // }

  @Get(':assetId')
  async getAsset(
    @Param('assetId', new ObjectIdValidationPipe()) assetId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const [metadata, file] = await this.assetsService.getAsset(assetId);
    res.set({
      'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.fileName)}"`,
      'Content-Type': metadata.mimeType,
      'Content-Length': metadata.size,
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    return file;
  }
}
