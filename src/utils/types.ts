import { EUserStatus } from '@constants/user.constant';
import { Conversation } from '@modules/conversations/schemas/conversation.schema';
import { Message } from '@modules/messages/schemas/message.schema';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  authData: AuthData;
}

export interface AuthData {
  _id: string;
  status: EUserStatus;
}

export interface NewMessageData {
  message: Message;
  conversation: Conversation;
}
