import { Conversation } from '@modules/conversations/schemas/conversation.schema';
import { MessageResponseDto } from '@modules/messages/dtos/message-response.dto';
import { Member } from '@modules/conversations/schemas/member.schema';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { transformObjectToResponse } from '@utils/api-response-builder.util';
import { AuthenticatedSocket, NewMessageData } from '@utils/types';
import { Model } from 'mongoose';
import { Server } from 'socket.io';

/* We cannot use env in the decorator, so the websocket will be configured in the adapter */
@WebSocketGateway()
export class WSGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    // add socket to room by userId
    socket.join(socket.authData._id);
    socket.emit('onConnected', true);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    // remove socket from room
    socket.leave(socket.authData._id);
  }

  @SubscribeMessage('ping')
  ping() {
    return 'pong';
  }

  @OnEvent('message.new')
  async handleNewMessageEvent(newMessageData: NewMessageData) {
    // send message to members
    newMessageData.conversation.members.forEach((member: Member) => {
      this.server
        .to(member.user)
        .emit(
          'onMessage',
          transformObjectToResponse(newMessageData.message, MessageResponseDto),
        );
    });
  }
}
