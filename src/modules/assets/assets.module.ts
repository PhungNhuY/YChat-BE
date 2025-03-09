import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
  ],
  providers: [AssetsService],
  controllers: [AssetsController],
  exports: [AssetsService],
})
export class AssetsModule {}
