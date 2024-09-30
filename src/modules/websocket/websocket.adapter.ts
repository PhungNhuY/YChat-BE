import { access_token_public_key } from '@constants/jwt.const';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthData, AuthenticatedSocket } from '@utils/types';
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
    // port and cors configuration
    port = this.configService.get<number>('WS_PORT');
    const origins = JSON.parse(
      this.configService.get<string>('WS_CORS_ALLOWED_LIST'),
    ) as string[];
    options.cors = {
      origin: origins,
      credentials: true,
    };

    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthenticatedSocket, next) => {
      // get cookie
      const { cookie: clientCookie } = socket.handshake.headers;
      if (!clientCookie) {
        return next(new Error('Not Authenticated. No cookies were sent'));
      }

      // get accesstoken from cookie
      const { access_token } = cookie.parse(clientCookie);
      if (!access_token) {
        return next(new Error('Not Authenticated'));
      }

      // verify access token
      jwt.verify(
        access_token,
        access_token_public_key,
        {},
        (error, payload) => {
          if (error) {
            return next(new Error('Invalid access token'));
          }
          socket.authData = payload as AuthData;
        },
      );

      next();
    });

    return server;
  }
}
