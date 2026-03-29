import { generateMockApyHistory } from './apy-history.helper';

describe('generateMockApyHistory', () => {
  it('should always return 7 items', () => {
    const points = generateMockApyHistory('pool-123', new Date('2026-03-29T12:00:00Z'));
    expect(points).toHaveLength(7);
  });

  it('should be deterministic for same poolId and date', () => {
    const now = new Date('2026-03-29T12:00:00Z');
    const a = generateMockApyHistory('pool-123', now);
    const b = generateMockApyHistory('pool-123', now);
    expect(a).toEqual(b);
  });
});

