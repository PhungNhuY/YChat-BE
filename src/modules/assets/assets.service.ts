import { IMAGE } from '@constants/asset.const';
import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthData } from '@utils/types';
import { rm } from 'node:fs/promises';
import { parse } from 'node:path';
import * as sharp from 'sharp';
import { Asset } from './schemas/asset.schema';
import { Model } from 'mongoose';
import { checkFileExists, getFileSize } from '@utils/file.util';
import { createReadStream } from 'node:fs';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private readonly assetModel: Model<Asset>,
  ) {}

  async uploadImage(file: Express.Multer.File, authData: AuthData) {
    try {
      // convert image to webp and move from temp to images folder
      const newFileName = parse(file.filename).name + '.webp';
      const newFilePath = file.destination + '/../images/' + newFileName;
      await this.convertImageToWebp(file.path, newFilePath);
      const newFileSize = await getFileSize(newFilePath);

      // save data to db
      const image = await this.assetModel.create({
        uploader: authData._id,
        fileName: newFileName,
        originalName: file.originalname,
        mimeType: IMAGE.WEBP_MIME_TYPE,
        path: newFilePath,
        size: newFileSize,
      });

      return image.toObject();
    } catch (error) {
      throw error;
    } finally {
      // remove old image
      await rm(file.path);
    }
  }

  async getAsset(assetId: string): Promise<[Asset, StreamableFile]> {
    const metadata = await this.assetModel
      .findOne({
        deleted_at: null,
        _id: assetId,
      })
      .lean();
    if (!metadata) throw new NotFoundException('Asset not found');

    // check file exists
    const fileExists = await checkFileExists(metadata.path);
    if (!fileExists) throw new NotFoundException('Asset not found');

    const file = createReadStream(metadata.path);
    return [metadata, new StreamableFile(file)];
  }

  private async convertImageToWebp(fromFile: string, toFile: string) {
    await sharp(fromFile)
      .resize({
        width: IMAGE.MAX_WIDTH,
        height: IMAGE.MAX_HEIGHT,
        fit: 'inside', // keep aspect ratio
      })
      .webp({ quality: IMAGE.WEBP_QUALITY })
      .toFile(toFile);
  }
}
