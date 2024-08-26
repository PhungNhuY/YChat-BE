import { EUserStatus } from '@constants/user.constant';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  authData: AuthData;
}

export interface AuthData {
  _id: string;
  status: EUserStatus;
}
