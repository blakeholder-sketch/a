const { formatDateTime, shortAmount } = require('../../src/utils/format');

describe('format utilities', () => {
  describe('shortAmount', () => {
    test('formats billions', () => {
      expect(shortAmount(1_500_000_000)).toBe('1.5B');
    });
    test('formats millions', () => {
      expect(shortAmount(5_000_000)).toBe('5M');
    });
    test('formats thousands', () => {
      expect(shortAmount(2_500)).toBe('2.5k');
    });
    test('returns raw number for small amounts', () => {
      expect(shortAmount(500)).toBe('500');
    });
    test('handles zero', () => {
      expect(shortAmount(0)).toBe('0');
    });
  });

  describe('formatDateTime', () => {
    test('formats valid ISO date', () => {
      const result = formatDateTime('2025-12-09');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
    test('returns input on invalid date', () => {
      expect(formatDateTime('invalid')).toBe('invalid');
    });
    test('returns input on undefined', () => {
      const result = formatDateTime(undefined);
      expect(result).toBe(undefined);
    });
  });
});
