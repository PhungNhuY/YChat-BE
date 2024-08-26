import { Conversation } from '@modules/conversations/schemas/conversation.schema';
import { MessageResponseDto } from '@modules/messages/dtos/message-response.dto';
import { Message } from '@modules/messages/schemas/message.schema';
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
import { AuthenticatedSocket } from '@utils/types';
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
  async handleNewMessageEvent(message: Message) {
    // find conversation
    const conversation = await this.conversationModel
      .findOne({
        deleted_at: null,
        _id: message.conversation,
      })
      .lean();
    if (!conversation) return;

    // send message to members
    conversation.members.forEach((memberId: string) => {
      this.server
        .to(memberId)
        .emit(
          'onMessage',
          transformObjectToResponse(message, MessageResponseDto),
        );
    });
  }
}
