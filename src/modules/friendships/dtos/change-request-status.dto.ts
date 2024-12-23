import { IsIn } from 'class-validator';
import { EFriendshipStatus } from '../schemas/friendship.schema';
import { Transform } from 'class-transformer';

export class changeRequestStatusDto {
  @IsIn([EFriendshipStatus.ACCEPTED, EFriendshipStatus.DECLINED])
  @Transform(({ value }) => {
    return parseInt(value);
  })
  status: EFriendshipStatus;
}
