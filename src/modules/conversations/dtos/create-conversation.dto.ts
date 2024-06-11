import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsMongoId,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EConversationType } from '../schemas/conversation.schema';

@ValidatorConstraint({ name: 'isValidMembersLength', async: false })
export class IsValidMembersLength implements ValidatorConstraintInterface {
  validate(members: string[], args: ValidationArguments) {
    const type = args.object['type'];
    if (type === EConversationType.ONE_TO_ONE) {
      return members.length === 2;
    } else if (type === EConversationType.GROUP) {
      return members.length >= 3;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const type = args.object['type'];
    if (type === EConversationType.ONE_TO_ONE) {
      return 'Conversation must have 2 people';
    } else if (type === EConversationType.GROUP) {
      return 'Group must have at least 3 people';
    }
  }
}

export class CreateConversationDto {
  @IsEnum(EConversationType)
  type: EConversationType;

  @IsMongoId({ each: true })
  @IsArray()
  @ArrayUnique()
  @Validate(IsValidMembersLength)
  members: string[];
}
