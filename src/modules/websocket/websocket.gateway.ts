import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthenticatedSocket } from '@utils/types';
import { Server } from 'socket.io';

@WebSocketGateway(2805)
export class WSGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    // console.log('new connection: ', socket.id);
  }

  @SubscribeMessage('ping')
  ping() {
    return 'pong';
  }
}
