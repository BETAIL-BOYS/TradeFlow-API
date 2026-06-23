import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../common/redis/redis.service';

/** How often each socket is probed for liveness (issue #158: ~30s heartbeat). */
const HEARTBEAT_INTERVAL_MS = 30_000;
/** Engine.io ping cadence — kept below the app heartbeat so a live client always refreshes liveness first. */
const PING_INTERVAL_MS = 25_000;
/** Engine.io waits this long for the client's pong before dropping the socket. */
const PING_TIMEOUT_MS = 20_000;

/**
 * Per-connection bookkeeping. Held in the {@link TradeGateway.clients} pool and
 * deleted on disconnect so a dropped socket (and everything it closes over) can
 * be garbage collected.
 */
interface ClientState {
  /** Refreshed whenever the client proves it is alive (engine pong or app pong). */
  isAlive: boolean;
  /** Per-socket heartbeat timer — MUST be cleared on disconnect to avoid a leak. */
  heartbeat: ReturnType<typeof setInterval>;
  /** Listeners we attached, kept so they can be detached on cleanup. */
  onPacket: (packet: { type: string }) => void;
  onPong: () => void;
  onError: (err: Error) => void;
}

/**
 * WebSocket Gateway for real-time trade updates.
 *
 * Subscribes to the Redis `live_trades` channel and broadcasts to connected
 * clients. Maintains an explicit connection pool with a heartbeat so that dead
 * or dropped sockets (issue #158) are pruned from memory rather than leaking:
 *
 * - Every socket is tracked in {@link clients} on connect and removed on
 *   disconnect, dropping all references to the socket instance.
 * - Engine.io ping/pong (`pingInterval`/`pingTimeout`) terminates connections
 *   whose underlying transport has gone away.
 * - An additional per-socket heartbeat forcibly disconnects ghost connections
 *   that stop responding, and its `setInterval` is always cleared on disconnect.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  pingInterval: PING_INTERVAL_MS,
  pingTimeout: PING_TIMEOUT_MS,
})
export class TradeGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TradeGateway.name);

  /** Active connection pool, keyed by socket id. */
  private readonly clients = new Map<string, ClientState>();

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

  /**
   * Registers a new connection in the pool and wires up its heartbeat.
   */
  handleConnection(client: Socket) {
    const markAlive = () => {
      const state = this.clients.get(client.id);
      if (state) {
        state.isAlive = true;
      }
    };

    // Treat any inbound engine pong (sent automatically by socket.io clients in
    // response to the server's ping) as proof of life — no client-side code
    // required. App-level 'heartbeat:pong' is also honored for custom clients.
    const onPacket = (packet: { type: string }) => {
      if (packet.type === 'pong') {
        markAlive();
      }
    };
    const onPong = () => markAlive();
    const onError = (err: Error) => {
      // Socket.IO emits 'disconnect' after a fatal 'error'; log for visibility.
      this.logger.error(`Socket error for ${client.id}: ${err?.message ?? err}`);
    };

    client.conn?.on('packet', onPacket);
    client.on('heartbeat:pong', onPong);
    client.on('error', onError);

    const heartbeat = setInterval(() => {
      const state = this.clients.get(client.id);
      if (!state) {
        return;
      }
      // A socket that is no longer connected, or hasn't proven liveness since
      // the last probe, is a ghost — force it closed so it gets cleaned up.
      if (!client.connected || !state.isAlive) {
        this.logger.warn(`Terminating unresponsive client: ${client.id}`);
        client.disconnect(true); // triggers handleDisconnect -> cleanup
        return;
      }
      state.isAlive = false;
      client.emit('heartbeat:ping');
    }, HEARTBEAT_INTERVAL_MS);

    this.clients.set(client.id, { isAlive: true, heartbeat, onPacket, onPong, onError });
    this.logger.log(
      `Client connected: ${client.id} (active connections: ${this.clients.size})`,
    );
  }

  /**
   * Tears down a connection: clears its heartbeat, detaches listeners, and drops
   * it from the pool so the socket instance is no longer referenced.
   */
  handleDisconnect(client: Socket) {
    const state = this.clients.get(client.id);
    if (state) {
      clearInterval(state.heartbeat);
      client.conn?.off('packet', state.onPacket);
      client.off('heartbeat:pong', state.onPong);
      client.off('error', state.onError);
      this.clients.delete(client.id);
    }
    this.logger.log(
      `Client disconnected: ${client.id} (active connections: ${this.clients.size})`,
    );
  }

  /**
   * Clears every per-socket timer on shutdown so no intervals outlive the module.
   */
  onModuleDestroy() {
    for (const state of this.clients.values()) {
      clearInterval(state.heartbeat);
    }
    this.clients.clear();
  }

  /**
   * Number of connections currently tracked in the pool. Exposed for health
   * checks and leak assertions in tests.
   */
  getConnectionCount(): number {
    return this.clients.size;
  }
}
