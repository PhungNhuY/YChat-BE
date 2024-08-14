import { access_token_public_key } from '@constants/jwt.const';
import { User } from '@modules/users/schemas/user.schema';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthenticatedSocket } from '@utils/types';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { ServerOptions } from 'socket.io';

export class WebSocketAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }
  createIOServer(port: number, options?: ServerOptions) {
    port = this.configService.get<number>('WS_PORT');
    const server = super.createIOServer(port, options);

    const origins = JSON.parse(
      this.configService.get<string>('WS_CORS_ALLOWED_LIST'),
    );
    options.cors = origins;

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
