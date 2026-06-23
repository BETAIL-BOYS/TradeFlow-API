import { Test, TestingModule } from '@nestjs/testing';
import { TradeGateway } from './trade.gateway';
import { RedisService } from '../common/redis/redis.service';

/**
 * Unit tests for the TradeGateway connection pool (issue #158).
 *
 * Verifies that connections are tracked on connect, fully removed on disconnect
 * (no leaked references or timers), that the heartbeat terminates ghost/dead
 * sockets, and that churning 500 clients leaves the pool empty.
 */
const HEARTBEAT_INTERVAL_MS = 30_000;

interface MockSocket {
  id: string;
  connected: boolean;
  conn: { on: jest.Mock; off: jest.Mock };
  on: jest.Mock;
  off: jest.Mock;
  emit: jest.Mock;
  disconnect: jest.Mock;
  trigger: (event: string, ...args: unknown[]) => void;
  triggerConn: (event: string, ...args: unknown[]) => void;
}

function createMockSocket(id: string): MockSocket {
  const handlers: Record<string, (...args: unknown[]) => void> = {};
  const connHandlers: Record<string, (...args: unknown[]) => void> = {};
  const socket: MockSocket = {
    id,
    connected: true,
    conn: {
      on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
        connHandlers[event] = handler;
      }),
      off: jest.fn(),
    },
    on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = handler;
    }),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(function (this: MockSocket) {
      this.connected = false;
    }),
    trigger: (event, ...args) => handlers[event]?.(...args),
    triggerConn: (event, ...args) => connHandlers[event]?.(...args),
  };
  return socket;
}

describe('TradeGateway (connection pool)', () => {
  let gateway: TradeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeGateway,
        { provide: RedisService, useValue: { subscribe: jest.fn() } },
      ],
    }).compile();

    gateway = module.get<TradeGateway>(TradeGateway);

    // Use jest's fake timers for the whole suite so the per-socket heartbeat is
    // deterministic and timer globals are consistently available. Enabled after
    // the async module compile so it doesn't interfere with promise resolution.
    jest.useFakeTimers();
  });

  afterEach(() => {
    gateway.onModuleDestroy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
    expect(gateway.getConnectionCount()).toBe(0);
  });

  it('tracks a connection on connect and releases it on disconnect', () => {
    const socket = createMockSocket('a');

    gateway.handleConnection(socket as never);
    expect(gateway.getConnectionCount()).toBe(1);

    gateway.handleDisconnect(socket as never);
    expect(gateway.getConnectionCount()).toBe(0);
  });

  it('clears the per-socket heartbeat on disconnect (no lingering interval)', () => {
    jest.useFakeTimers();
    const clearSpy = jest.spyOn(global, 'clearInterval');
    const socket = createMockSocket('a');

    gateway.handleConnection(socket as never);
    gateway.handleDisconnect(socket as never);

    expect(clearSpy).toHaveBeenCalled();

    // After disconnect, advancing time must not emit further heartbeats.
    socket.emit.mockClear();
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS * 3);
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it('detaches every listener it attached on disconnect', () => {
    const socket = createMockSocket('a');

    gateway.handleConnection(socket as never);
    gateway.handleDisconnect(socket as never);

    expect(socket.off).toHaveBeenCalledWith('heartbeat:pong', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('error', expect.any(Function));
    expect(socket.conn.off).toHaveBeenCalledWith('packet', expect.any(Function));
  });

  it('sends a heartbeat ping and keeps a responsive client alive', () => {
    jest.useFakeTimers();
    const socket = createMockSocket('a');
    gateway.handleConnection(socket as never);

    // First probe: emits an app-level ping and marks the client unproven.
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    expect(socket.emit).toHaveBeenCalledWith('heartbeat:ping');

    // Client proves liveness (engine pong packet).
    socket.triggerConn('packet', { type: 'pong' });

    // Next probe: still alive, so it is NOT disconnected.
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    expect(socket.disconnect).not.toHaveBeenCalled();
    expect(gateway.getConnectionCount()).toBe(1);
  });

  it('terminates an unresponsive (ghost) client', () => {
    jest.useFakeTimers();
    const socket = createMockSocket('a');
    gateway.handleConnection(socket as never);

    // Two probes with no pong in between → second probe terminates it.
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS); // marks unproven, pings
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS); // still unproven → disconnect
    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });

  it('terminates a client whose transport already dropped', () => {
    jest.useFakeTimers();
    const socket = createMockSocket('a');
    gateway.handleConnection(socket as never);

    socket.connected = false; // transport gone but still in the pool
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });

  it('does not leak references when 500 clients connect and disconnect', () => {
    const sockets = Array.from({ length: 500 }, (_, i) =>
      createMockSocket(`client-${i}`),
    );

    sockets.forEach((s) => gateway.handleConnection(s as never));
    expect(gateway.getConnectionCount()).toBe(500);

    sockets.forEach((s) => gateway.handleDisconnect(s as never));
    expect(gateway.getConnectionCount()).toBe(0);
  });

  it('clears all timers on module destroy', () => {
    jest.useFakeTimers();
    const clearSpy = jest.spyOn(global, 'clearInterval');
    [createMockSocket('a'), createMockSocket('b')].forEach((s) =>
      gateway.handleConnection(s as never),
    );
    expect(gateway.getConnectionCount()).toBe(2);

    gateway.onModuleDestroy();

    expect(gateway.getConnectionCount()).toBe(0);
    expect(clearSpy).toHaveBeenCalledTimes(2);
  });
});
