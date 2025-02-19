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

  // Graceful shutdown
  async onModuleDestroy() {
    // force exit after few seconds
    const forceExitTimeout = 10;
    setTimeout(() => {
      console.error(
        `⏳ Server shutdown timeout exceeded (${forceExitTimeout}s), forcing exit.`,
      );
      process.exit(1);
    }, forceExitTimeout * 1000);

    // Stops the server from accepting new connections
    // and keeps existing connections
    if (this.server) {
      console.log('🛑 Stopping HTTP requests...');
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
