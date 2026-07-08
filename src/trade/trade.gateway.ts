import { OnModuleInit, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RedisService } from '../common/redis/redis.service';

/**
 * WebSocket Gateway for real-time trade updates.
 * Subscribes to Redis 'live_trades' channel and broadcasts messages to connected clients.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TradeGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TradeGateway.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Initializes the gateway and starts listening for Redis messages.
   */
  onModuleInit() {
    this.redisService.subscribe('live_trades', (message) => {
      this.logger.log(`Received trade from Redis: ${message}`);
      this.server.emit('trade', JSON.parse(message));
    });
  }
}
