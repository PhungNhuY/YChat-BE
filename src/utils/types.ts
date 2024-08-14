import { EUserStatus } from '@constants/user.constant';
import { User } from '@modules/users/schemas/user.schema';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user?: User;
}

export interface AuthData {
  _id: string;
  status: EUserStatus;
}
