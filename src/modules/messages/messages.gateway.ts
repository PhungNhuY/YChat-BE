import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit, UseFilters } from '@nestjs/common';
import { Server } from 'socket.io';
import { GlobalExceptionFilter } from '@filters/global-exception.filter';

@WebSocketGateway()
@UseFilters(GlobalExceptionFilter)
export class MessagesGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    // this.server.on('connection', (socket) => {
    //   console.log(socket.id);
    // });
  }

  @SubscribeMessage('ping')
  ping(): string {
    return 'pong';
  }

  @SubscribeMessage('createMessage')
  async createMessage() {}
}
