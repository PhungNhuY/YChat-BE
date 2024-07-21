import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthenticatedSocket } from '@utils/types';
import { Server } from 'socket.io';

@WebSocketGateway(2805, {
  path: '/ws',
  cors: {
    origin: ['http://localhost:2803'],
    credentials: true,
  },
})
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
