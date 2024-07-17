import { access_token_public_key } from '@constants/jwt.const';
import { User } from '@modules/users/schemas/user.schema';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthenticatedSocket } from '@utils/types';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';

export class WebSocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);

    server.use(async (socket: AuthenticatedSocket, next) => {
      const { cookie: clientCookie } = socket.handshake.headers;
      if (!clientCookie) {
        return next(new Error('Not Authenticated. No cookies were sent'));
      }

      const { access_token } = cookie.parse(clientCookie);
      if (!access_token) {
        return next(new Error('Not Authenticated'));
      }

      jwt.verify(
        access_token,
        access_token_public_key,
        {},
        (error, payload) => {
          if (error) {
            return next(new Error('Invalid access token'));
          }
          socket.user = payload as User;
        },
      );

      next();
    });

    return server;
  }
}
