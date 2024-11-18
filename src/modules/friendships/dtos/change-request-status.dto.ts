import { IsIn } from 'class-validator';
import { EFriendshipStatus } from '../schemas/friendship.schema';

export class changeRequestStatusDto {
  @IsIn([EFriendshipStatus.ACCEPTED, EFriendshipStatus.DECLINED])
  status: EFriendshipStatus;
}
