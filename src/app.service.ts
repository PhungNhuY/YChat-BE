import {
  Injectable,
  OnApplicationShutdown,
  OnModuleDestroy,
} from '@nestjs/common';
import { Server } from 'node:http';

@Injectable()
export class AppService implements OnApplicationShutdown, OnModuleDestroy {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  async onModuleDestroy() {
    // Graceful shutdown

    console.log('🛑 Stopping HTTP requests...');
    if (this.server) {
      // force exit after 10s
      setTimeout(() => {
        console.error(
          '⏳ Server shutdown timeout exceeded (10s), forcing exit.',
        );
        process.exit(1);
      }, 10 * 1000);

      // Stops the server from accepting new connections
      // and keeps existing connections
      this.server.close(() => {
        console.log('✅ HTTP Server closed');
      });
    }
  }

  async onApplicationShutdown(signal?: string) {
    console.log(`🚦 Application shutting down due to: ${signal}`);
  }

  getHello(): string {
    return 'YChat Service';
  }
}
