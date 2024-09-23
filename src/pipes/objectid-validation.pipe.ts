import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!Types.ObjectId.isValid(value))
      throw new NotFoundException('Resource not found');
    return value;
  }
}
