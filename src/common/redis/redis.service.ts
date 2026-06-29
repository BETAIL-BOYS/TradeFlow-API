import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Service for managing Redis connections and operations.
 * Provides separate clients for publishing and subscribing to channels.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public redisPublisher: Redis;
  public redisSubscriber: Redis;

  constructor(private configService: ConfigService) {}

  /**
   * Initializes Redis connections when the module starts.
   */
  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;

    const redisOptions = {
      host,
      port,
      maxRetriesPerRequest: null, // Bypasses internal request queuing blocks when disconnected
      enableReadyCheck: false,     // Skips strict server checks during initialization loops
      connectTimeout: 2000,        // Stops attempting connection quickly if no instance exists
      // Kill the infinite retry stream instantly if no local server is active
      retryStrategy: () => {
        return null; // Tells ioredis to stop attempting subsequent reconnection loops
      },
    };

    this.redisPublisher = new Redis(redisOptions);
    this.redisSubscriber = new Redis(redisOptions);

    this.redisPublisher.on('connect', () => this.logger.log('Redis Publisher connected'));
    this.redisSubscriber.on('connect', () => this.logger.log('Redis Subscriber connected'));

    // Catch the initial discovery failure cleanly without screaming error sequences
    this.redisPublisher.on('error', () => {
      this.logger.warn(`Redis tracking network offline (Host: ${host}:${port}). Bypassing telemetry streaming metrics locally.`);
    });
    this.redisSubscriber.on('error', () => {
      // Catch and suppress secondary subscription link errors silently
    });
  }

  /**
   * Disconnects Redis clients when the module is destroyed.
   */
  onModuleDestroy() {
    if (this.redisPublisher) this.redisPublisher.disconnect();
    if (this.redisSubscriber) this.redisSubscriber.disconnect();
  }

  /**
   * Publishes a message to a specific Redis channel.
   */
  async publish(channel: string, message: string) {
    try {
      if (this.redisPublisher && this.redisPublisher.status === 'ready') {
        await this.redisPublisher.publish(channel, message);
      }
    } catch (err) {
      // Suppress execution faults when offline
    }
  }

  /**
   * Subscribes to a Redis channel and executes a callback on every message.
   */
  async subscribe(channel: string, callback: (message: string) => void) {
    try {
      if (this.redisSubscriber && this.redisSubscriber.status === 'ready') {
        await this.redisSubscriber.subscribe(channel);
      }
      this.redisSubscriber.on('message', (chan, msg) => {
        if (chan === channel) {
          callback(msg);
        }
      });
    } catch (err) {
      // Suppress connection faults when offline
    }
  }
}