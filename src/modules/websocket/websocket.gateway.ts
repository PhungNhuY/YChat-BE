import { Message } from '@modules/messages/schemas/message.schema';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthenticatedSocket } from '@utils/types';
import { Server } from 'socket.io';

/* We cannot use env in the decorator, so the websocket will be configured in the adapter */
@WebSocketGateway()
export class WSGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    // console.log('new connection: ', socket.id);
    // socket.emit('connected', {});
  }

  handleDisconnect(socket: AuthenticatedSocket) {}

  @SubscribeMessage('ping')
  ping() {
    return 'pong';
  }

  @OnEvent('message.new')
  handleNewMessageEvent(data: Message) {
    this.server.emit('onMessage', data);
  }
}
